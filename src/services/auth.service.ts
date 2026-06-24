import { User, IUserDocument } from '../models/user.model';
import { generateTokenPair, verifyRefreshToken, TokenPayload } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';
import { HTTP_STATUS, AUTH_MESSAGES } from '../utils/constants';

export interface IRegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IAuthResponse {
  user: Partial<IUserDocument>;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  async register(userData: IRegisterRequest): Promise<IAuthResponse> {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new ApiError(HTTP_STATUS.CONFLICT, AUTH_MESSAGES.EMAIL_EXISTS);
    }

    const user = await User.create(userData);

    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const tokens = generateTokenPair(tokenPayload);
    await User.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });

    return {
      user: { name: user.name, email: user.email, role: user.role, isActive: user.isActive },
      ...tokens,
    };
  }

  async login(credentials: ILoginRequest): Promise<IAuthResponse> {
    const user = await User.findOne({ email: credentials.email }).select('+password');
    if (!user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.INVALID_CREDENTIALS);
    }

    if (!user.isActive) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Account is deactivated');
    }

    const isPasswordValid = await user.comparePassword(credentials.password);
    if (!isPasswordValid) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.INVALID_CREDENTIALS);
    }

    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const tokens = generateTokenPair(tokenPayload);
    await User.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });

    return {
      user: { name: user.name, email: user.email, role: user.role, isActive: user.isActive },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    let decoded: TokenPayload;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.INVALID_TOKEN);
    }

    const user = await User.findById(decoded.userId).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.INVALID_TOKEN);
    }

    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const tokens = generateTokenPair(tokenPayload);
    await User.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });

    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
  }

  async getProfile(userId: string): Promise<IUserDocument> {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, AUTH_MESSAGES.USER_NOT_FOUND);
    }
    return user;
  }
}
