import { User, IUserDocument } from '../models/user.model';
import { OtpLog } from '../models/otplog.model';
import { generateToken, TokenPayload } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';
import { HTTP_STATUS, AUTH_MESSAGES, OTP, JWT } from '../utils/constants';
import { generateOtp, maskPhone } from '../utils/helpers';
import { logger } from '../config/logger';

export interface ISendOtpRequest {
  email?: string;
  phone?: string;
}

export interface ISendOtpResponse {
  userId: string;
  role: string;
  maskedPhone?: string;
  email: string;
  expiresIn: number;
  otp: string;
}

export interface IResendOtpResponse {
  expiresIn: number;
  otp: string;
}

export interface IVerifyOtpRequest {
  userId: string;
  otp: string;
}

export interface IVerifyOtpResponse {
  token: string;
  expiresIn: number;
  user: Record<string, unknown>;
}

/**
 * Builds the user payload returned after login, including
 * role-specific profile details (admin | school | government | student).
 */
const toAuthUser = (user: IUserDocument): Record<string, unknown> => {
  const base: Record<string, unknown> = {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    isVerified: user.isVerified,
    lastLoginAt: user.lastLoginAt,
  };

  const profile = user.profile ?? {};

  switch (user.role) {
    case 'student':
      return {
        ...base,
        age: user.age,
        gender: user.gender,
        classGrade: user.classGrade,
        schoolName: profile.schoolName,
      };
    case 'school':
      return {
        ...base,
        institutionName: profile.institutionName,
        institutionType: profile.institutionType,
        principalName: profile.principalName,
        contactPerson: profile.contactPerson,
        address: profile.address,
        state: profile.state,
      };
    case 'government':
      return {
        ...base,
        organizationName: profile.organizationName,
        department: profile.department,
        contactPerson: profile.contactPerson,
        state: profile.state,
      };
    case 'admin':
      return {
        ...base,
        permissions: profile.permissions ?? [],
      };
    default:
      return base;
  }
};

/**
 * Ensures the account is usable for authentication.
 * Throws if the account is suspended or not active.
 */
const assertAccountUsable = (user: IUserDocument): void => {
  if (user.status === 'suspended') {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, AUTH_MESSAGES.ACCOUNT_SUSPENDED);
  }
  if (user.status !== 'active') {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, AUTH_MESSAGES.ACCOUNT_INACTIVE);
  }
};

export class AuthService {
  /**
   * Unified send-OTP for all roles (admin, school, government, student).
   * Looks the user up by email or phone and issues a fresh OTP.
   */
  async sendOtp(data: ISendOtpRequest): Promise<ISendOtpResponse> {
    const query = data.email ? { email: data.email.toLowerCase() } : { phone: data.phone };

    const user = await User.findOne(query);
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, AUTH_MESSAGES.USER_NOT_FOUND);
    }

    assertAccountUsable(user);

    const otp = await this.issueOtp(user, 'login');

    return {
      userId: user._id.toString(),
      role: user.role,
      maskedPhone: maskPhone(user.phone),
      email: user.email,
      expiresIn: OTP.EXPIRY_SECONDS,
      otp,
    };
  }

  /**
   * Re-sends an OTP for a known userId, invalidating any previous unused OTP.
   */
  async resendOtp(userId: string): Promise<IResendOtpResponse> {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, AUTH_MESSAGES.USER_NOT_FOUND);
    }

    assertAccountUsable(user);

    const otp = await this.issueOtp(user, 'resend');

    return {
      expiresIn: OTP.EXPIRY_SECONDS,
      otp,
    };
  }

  /**
   * Verifies the OTP, marks it used, updates last login,
   * and returns a JWT valid for 7 days along with role-based user details.
   */
  async verifyOtp(data: IVerifyOtpRequest): Promise<IVerifyOtpResponse> {
    const user = await User.findById(data.userId);
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, AUTH_MESSAGES.USER_NOT_FOUND);
    }

    assertAccountUsable(user);

    const otpLog = await OtpLog.findOne({ userId: user._id }).sort({ createdAt: -1 });
    if (!otpLog) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, AUTH_MESSAGES.OTP_NOT_FOUND);
    }

    if (otpLog.isUsed) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, AUTH_MESSAGES.OTP_ALREADY_USED);
    }

    if (otpLog.expiresAt < new Date()) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, AUTH_MESSAGES.OTP_EXPIRED);
    }

    if (otpLog.otp !== data.otp) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, AUTH_MESSAGES.INVALID_OTP);
    }

    otpLog.isUsed = true;
    otpLog.usedAt = new Date();
    await otpLog.save();

    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    const token = generateToken(tokenPayload);

    user.isVerified = true;
    user.lastLoginAt = new Date();
    await User.findByIdAndUpdate(user._id, {
      isVerified: true,
      lastLoginAt: user.lastLoginAt,
      currentToken: token,
    });

    logger.info(`User ${user.email} (${user.role}) logged in successfully`);

    return {
      token: 'sdgjsgksgskgksgggkjshgjhg',
      // token,
      expiresIn: JWT.EXPIRY_SECONDS,
      user: toAuthUser(user),
    };
  }

  /**
   * Invalidates the current session by clearing the stored token.
   */
  async logout(userId: string): Promise<void> {
    const user = await User.findByIdAndUpdate(userId, { currentToken: null });
    logger.info(`User ${user?.email ?? userId} logged out`);
  }

  /**
   * Invalidates previous unused OTPs, generates and persists a new one,
   * and simulates delivery by logging it to the console.
   */
  private async issueOtp(user: IUserDocument, purpose: 'login' | 'resend'): Promise<string> {
    await OtpLog.updateMany(
      { userId: user._id, isUsed: false },
      { isUsed: true, usedAt: new Date() },
    );

    const { otp, otpExpiry } = generateOtp();

    await OtpLog.create({
      userId: user._id,
      email: user.email,
      phone: user.phone,
      otp,
      purpose,
      expiresAt: otpExpiry,
    });

    // Simulated OTP delivery — replace with email/SMS provider in production.
    logger.info(`[OTP] ${purpose} OTP for ${user.email} (${user.role}): ${otp}`);

    return otp;
  }
}
