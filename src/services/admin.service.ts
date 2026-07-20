import {
  User,
  IUserDocument,
  IUserProfile,
  InstitutionType,
  UserStatus,
} from '../models/user.model';
import { ApiError } from '../utils/ApiError';
import { HTTP_STATUS } from '../utils/constants';
import { isValidObjectId, getPaginationParams, buildPaginationMeta } from '../utils/helpers';
import { ROLES, Role } from '../constants/roles';

export interface ICreateSchoolRequest {
  institutionName: string;
  principalName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  institutionType: InstitutionType;
}

export interface ICreateGovernmentRequest {
  organizationName: string;
  department: string;
  contactPerson: string;
  email: string;
  phone: string;
  city: string;
}

export interface IRegisteredUserResponse {
  _id: string;
  role: Role;
  status: string;
  email: string;
}

export interface ISchoolOnboardingItem {
  _id: string;
  institutionName?: string;
  principalName?: string;
  city?: string;
  state?: string;
  email: string;
  phone?: string;
  status: string;
  createdAt?: Date | string;
}

export interface IGovernmentOnboardingItem {
  _id: string;
  organizationName?: string;
  department?: string;
  contactPerson?: string;
  city?: string;
  state?: string;
  email: string;
  phone?: string;
  status: string;
  createdAt?: Date | string;
}

export interface IListPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IOnboardingListQuery {
  search?: string;
  page?: number;
  limit?: number;
  status?: UserStatus;
}

export interface IRoleStatusSummary {
  total: number;
  approved: number;
  pending: number;
}

export interface IOnboardingDashboardSummary {
  schools: IRoleStatusSummary;
  governments: IRoleStatusSummary;
  students: IRoleStatusSummary;
}

export interface IOnboardingSchoolsResponse {
  schools: ISchoolOnboardingItem[];
  pagination: IListPagination;
}

export interface IOnboardingGovernmentsResponse {
  governments: IGovernmentOnboardingItem[];
  pagination: IListPagination;
}

export interface ISchoolDetails {
  _id: string;
  institutionName?: string;
  institutionType?: string;
  principalName?: string;
  contactPerson?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  status: string;
  isVerified: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IGovernmentDetails {
  _id: string;
  organizationName?: string;
  department?: string;
  contactPerson?: string;
  email: string;
  phone?: string;
  city?: string;
  status: string;
  isVerified: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

const SCHOOL_SELECT =
  '_id email phone status profile.institutionName profile.principalName profile.city profile.state createdAt';
const GOVERNMENT_SELECT =
  '_id email phone status profile.organizationName profile.department profile.contactPerson profile.city profile.state createdAt';
const SCHOOL_DETAILS_SELECT =
  '_id email phone status isVerified role createdAt updatedAt profile.institutionName profile.institutionType profile.principalName profile.contactPerson profile.address profile.city profile.state';
const GOVERNMENT_DETAILS_SELECT =
  '_id email phone status isVerified role createdAt updatedAt profile.organizationName profile.department profile.contactPerson profile.city';

export class AdminService {
  async createSchool(data: ICreateSchoolRequest): Promise<IRegisteredUserResponse> {
    await this.assertEmailAndPhoneUnique(data.email, data.phone);

    const profile: IUserProfile = {
      institutionName: data.institutionName,
      principalName: data.principalName,
      contactPerson: data.contactPerson,
      address: data.address,
      city: data.city,
      state: data.state,
      institutionType: data.institutionType,
    };

    const user = await this.createUser({
      fullName: data.institutionName,
      email: data.email,
      phone: data.phone,
      role: ROLES.SCHOOL,
      profile,
    });

    return this.toRegisteredUserResponse(user);
  }

  async createGovernment(data: ICreateGovernmentRequest): Promise<IRegisteredUserResponse> {
    await this.assertEmailAndPhoneUnique(data.email, data.phone);

    const profile: IUserProfile = {
      organizationName: data.organizationName,
      department: data.department,
      contactPerson: data.contactPerson,
      city: data.city,
    };

    const user = await this.createUser({
      fullName: data.organizationName,
      email: data.email,
      phone: data.phone,
      role: ROLES.GOVERNMENT,
      profile,
    });

    return this.toRegisteredUserResponse(user);
  }

  async getOnboardingDashboardSummary(): Promise<IOnboardingDashboardSummary> {
    const [schools, governments, students] = await Promise.all([
      this.getRoleStatusSummary(ROLES.SCHOOL),
      this.getRoleStatusSummary(ROLES.GOVERNMENT),
      this.getRoleStatusSummary(ROLES.STUDENT),
    ]);

    return { schools, governments, students };
  }

  async getOnboardingSchools(
    query: IOnboardingListQuery = {},
  ): Promise<IOnboardingSchoolsResponse> {
    const { skip, limit, page } = getPaginationParams(query.page, query.limit);
    const filter = this.buildSchoolFilter(query.search, query.status);

    const [schools, total] = await Promise.all([
      User.find(filter)
        .select(SCHOOL_SELECT)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return {
      schools: schools.map((school) => this.mapSchoolResponse(school)),
      pagination: this.toListPagination(total, page, limit),
    };
  }

  async getOnboardingGovernments(
    query: IOnboardingListQuery = {},
  ): Promise<IOnboardingGovernmentsResponse> {
    const { skip, limit, page } = getPaginationParams(query.page, query.limit);
    const filter = this.buildGovernmentFilter(query.search, query.status);

    const [governments, total] = await Promise.all([
      User.find(filter)
        .select(GOVERNMENT_SELECT)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return {
      governments: governments.map((government) => this.mapGovernmentResponse(government)),
      pagination: this.toListPagination(total, page, limit),
    };
  }

  async getSchoolById(id: string): Promise<ISchoolDetails> {
    const user = await this.findUserByIdAndRole(id, ROLES.SCHOOL, 'School', SCHOOL_DETAILS_SELECT);
    return this.mapSchoolDetails(user);
  }

  async getGovernmentById(id: string): Promise<IGovernmentDetails> {
    const user = await this.findUserByIdAndRole(
      id,
      ROLES.GOVERNMENT,
      'Government',
      GOVERNMENT_DETAILS_SELECT,
    );
    return this.mapGovernmentDetails(user);
  }

  async approveSchool(id: string): Promise<IUserDocument> {
    return this.approveUser(id, ROLES.SCHOOL, 'School');
  }

  async approveGovernment(id: string): Promise<IUserDocument> {
    return this.approveUser(id, ROLES.GOVERNMENT, 'Government');
  }

  private async getRoleStatusSummary(role: Role): Promise<IRoleStatusSummary> {
    const [result] = await User.aggregate<{
      total: number;
      approved: number;
      pending: number;
    }>([
      { $match: { role } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
          },
        },
      },
    ]);

    return {
      total: result?.total ?? 0,
      approved: result?.approved ?? 0,
      pending: result?.pending ?? 0,
    };
  }

  private buildSchoolFilter(search?: string, status?: UserStatus): Record<string, unknown> {
    const filter: Record<string, unknown> = { role: ROLES.SCHOOL };

    if (status) {
      filter.status = status;
    }

    const trimmedSearch = search?.trim();
    if (trimmedSearch) {
      const regex = this.buildSearchRegex(trimmedSearch);
      filter.$or = [
        { email: regex },
        { phone: regex },
        { 'profile.institutionName': regex },
        { 'profile.principalName': regex },
        { 'profile.city': regex },
        { 'profile.state': regex },
      ];
    }

    return filter;
  }

  private buildGovernmentFilter(search?: string, status?: UserStatus): Record<string, unknown> {
    const filter: Record<string, unknown> = { role: ROLES.GOVERNMENT };

    if (status) {
      filter.status = status;
    }

    const trimmedSearch = search?.trim();
    if (trimmedSearch) {
      const regex = this.buildSearchRegex(trimmedSearch);
      filter.$or = [
        { email: regex },
        { phone: regex },
        { 'profile.organizationName': regex },
        { 'profile.department': regex },
        { 'profile.contactPerson': regex },
        { 'profile.city': regex },
        { 'profile.state': regex },
      ];
    }

    return filter;
  }

  private buildSearchRegex(search: string): RegExp {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(escaped, 'i');
  }

  private toListPagination(total: number, page: number, limit: number): IListPagination {
    const meta = buildPaginationMeta(total, page, limit);
    return {
      total: meta.total,
      page: meta.page,
      limit: meta.limit,
      totalPages: meta.totalPages,
    };
  }

  private async approveUser(
    id: string,
    expectedRole: Role,
    entityLabel: string,
  ): Promise<IUserDocument> {
    const user = await this.findUserByIdAndRole(id, expectedRole, entityLabel);

    if (user.status !== 'pending') {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, `${entityLabel} already approved`);
    }

    user.status = 'active';
    user.isVerified = true;
    await user.save();

    return user;
  }

  private async findUserByIdAndRole(
    id: string,
    expectedRole: Role,
    entityLabel: string,
    select?: string,
  ): Promise<IUserDocument> {
    if (!isValidObjectId(id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid ObjectId');
    }

    const query = User.findById(id);
    if (select) {
      query.select(select);
    }

    const user = await query;

    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    if (user.role !== expectedRole) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Invalid role. Expected ${entityLabel} user.`);
    }

    return user;
  }

  private mapSchoolResponse(user: {
    _id: { toString(): string };
    email: string;
    phone?: string;
    status: string;
    createdAt?: Date;
    profile?: IUserProfile | null;
  }): ISchoolOnboardingItem {
    return {
      _id: user._id.toString(),
      institutionName: user.profile?.institutionName,
      principalName: user.profile?.principalName,
      city: user.profile?.city,
      state: user.profile?.state,
      email: user.email,
      phone: user.phone,
      status: user.status,
      createdAt: user.createdAt,
    };
  }

  private mapGovernmentResponse(user: {
    _id: { toString(): string };
    email: string;
    phone?: string;
    status: string;
    createdAt?: Date;
    profile?: IUserProfile | null;
  }): IGovernmentOnboardingItem {
    return {
      _id: user._id.toString(),
      organizationName: user.profile?.organizationName,
      department: user.profile?.department,
      contactPerson: user.profile?.contactPerson,
      city: user.profile?.city,
      state: user.profile?.state,
      email: user.email,
      phone: user.phone,
      status: user.status,
      createdAt: user.createdAt,
    };
  }

  private mapSchoolDetails(user: IUserDocument): ISchoolDetails {
    return {
      _id: user._id.toString(),
      institutionName: user.profile?.institutionName,
      institutionType: user.profile?.institutionType,
      principalName: user.profile?.principalName,
      contactPerson: user.profile?.contactPerson,
      email: user.email,
      phone: user.phone,
      address: user.profile?.address,
      city: user.profile?.city,
      state: user.profile?.state,
      status: user.status,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private mapGovernmentDetails(user: IUserDocument): IGovernmentDetails {
    return {
      _id: user._id.toString(),
      organizationName: user.profile?.organizationName,
      department: user.profile?.department,
      contactPerson: user.profile?.contactPerson,
      email: user.email,
      phone: user.phone,
      city: user.profile?.city,
      status: user.status,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private async assertEmailAndPhoneUnique(email: string, phone: string): Promise<void> {
    const [existingEmail, existingPhone] = await Promise.all([
      User.findOne({ email: email.toLowerCase() }).select('_id').lean(),
      User.findOne({ phone }).select('_id').lean(),
    ]);

    if (existingEmail) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Email already exists');
    }

    if (existingPhone) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Phone number already exists');
    }
  }

  private async createUser(params: {
    fullName: string;
    email: string;
    phone: string;
    role: Role;
    profile: IUserProfile;
  }): Promise<IUserDocument> {
    return User.create({
      fullName: params.fullName,
      email: params.email.toLowerCase(),
      phone: params.phone,
      role: params.role,
      status: 'active',
      isVerified: true,
      profile: params.profile,
    });
  }

  private toRegisteredUserResponse(user: IUserDocument): IRegisteredUserResponse {
    return {
      _id: user._id.toString(),
      role: user.role,
      status: user.status,
      email: user.email,
    };
  }
}
