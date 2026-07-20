import { Types } from 'mongoose';
import { User, IUserDocument, IUserProfile, Gender, UserStatus } from '../models/user.model';
import { ApiError } from '../utils/ApiError';
import { HTTP_STATUS } from '../utils/constants';
import { isValidObjectId, getPaginationParams, buildPaginationMeta } from '../utils/helpers';
import { ROLES, Role } from '../constants/roles';

export interface IRegisterStudentRequest {
  fullName: string;
  age: number;
  gender: Gender;
  classGrade: string;
  schoolId: string;
  city: string;
  email: string;
  phone: string;
}

export interface IRegisteredStudentResponse {
  _id: string;
  fullName: string;
  age: number;
  gender: Gender;
  classGrade: string;
  role: Role;
  email: string;
  phone?: string;
  schoolId: string;
  status: string;
  isVerified: boolean;
  profile: {
    schoolName?: string;
    city?: string;
    admissionNumber?: string;
  };
}

export interface ISchoolDropdownItem {
  id: string;
  institutionName: string;
}

export interface IStudentListItem {
  _id: string;
  fullName: string;
  age?: number;
  gender?: string;
  classGrade?: string;
  schoolId?: string;
  schoolName?: string;
  city?: string;
  admissionNumber?: string;
  email: string;
  phone?: string;
  status: string;
  createdAt?: Date | string;
}

export interface IStudentDetails {
  _id: string;
  fullName: string;
  age?: number;
  gender?: string;
  classGrade?: string;
  schoolId?: string;
  schoolName?: string;
  city?: string;
  admissionNumber?: string;
  email: string;
  phone?: string;
  status: string;
  isVerified: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IStudentListQuery {
  search?: string;
  page?: number;
  limit?: number;
  status?: UserStatus;
  grade?: string;
  schoolId?: string;
}

export interface IStudentListResponse {
  students: IStudentListItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const STUDENT_LIST_SELECT =
  '_id fullName age gender classGrade email phone status schoolId profile.schoolName profile.city profile.admissionNumber createdAt';
const STUDENT_DETAILS_SELECT =
  '_id fullName age gender classGrade email phone status isVerified role schoolId createdAt updatedAt profile.schoolName profile.city profile.admissionNumber';

export class StudentService {
  async registerStudent(data: IRegisterStudentRequest): Promise<IRegisteredStudentResponse> {
    await this.assertEmailAndPhoneUnique(data.email, data.phone);

    const school = await this.findActiveSchool(data.schoolId);
    const schoolName = school.profile?.institutionName?.trim() || school.fullName;

    const student = await User.create({
      fullName: data.fullName,
      age: data.age,
      gender: data.gender,
      classGrade: data.classGrade,
      role: ROLES.STUDENT,
      email: data.email.toLowerCase(),
      phone: data.phone,
      schoolId: school._id,
      status: 'pending',
      isVerified: false,
      profile: {
        schoolName,
        city: data.city,
      },
    });

    return this.toRegisteredStudentResponse(student);
  }

  async getStudents(query: IStudentListQuery = {}): Promise<IStudentListResponse> {
    const { skip, limit, page } = getPaginationParams(query.page, query.limit);
    const filter = this.buildStudentFilter(query);

    const [students, total] = await Promise.all([
      User.find(filter)
        .select(STUDENT_LIST_SELECT)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    const meta = buildPaginationMeta(total, page, limit);

    return {
      students: students.map((student) => this.mapStudentListItem(student)),
      pagination: {
        total: meta.total,
        page: meta.page,
        limit: meta.limit,
        totalPages: meta.totalPages,
      },
    };
  }

  async getStudentById(id: string): Promise<IStudentDetails> {
    if (!isValidObjectId(id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid ObjectId');
    }

    const student = await User.findById(id).select(STUDENT_DETAILS_SELECT);

    if (!student) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    if (student.role !== ROLES.STUDENT) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid role. Expected Student user.');
    }

    return this.mapStudentDetails(student);
  }

  async approveStudent(id: string): Promise<IUserDocument> {
    if (!isValidObjectId(id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid ObjectId');
    }

    const student = await User.findById(id);

    if (!student) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    if (student.role !== ROLES.STUDENT) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid role. Expected Student user.');
    }

    if (student.status !== 'pending') {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Student already approved');
    }

    student.status = 'active';
    student.isVerified = true;
    await student.save();

    return student;
  }

  async getSchoolDropdown(): Promise<ISchoolDropdownItem[]> {
    const schools = await User.find({
      role: ROLES.SCHOOL,
      status: 'active',
    })
      .select('_id profile.institutionName')
      .sort({ 'profile.institutionName': 1 })
      .lean();

    return schools.map((school) => ({
      id: school._id.toString(),
      institutionName: school.profile?.institutionName ?? '',
    }));
  }

  buildStudentFilter(query: IStudentListQuery = {}): Record<string, unknown> {
    const filter: Record<string, unknown> = { role: ROLES.STUDENT };

    if (query.schoolId) {
      filter.schoolId = new Types.ObjectId(query.schoolId);
    }

    if (query.status) {
      filter.status = query.status;
    }

    const grade = query.grade?.trim();
    if (grade) {
      filter.classGrade = grade;
    }

    const trimmedSearch = query.search?.trim();
    if (trimmedSearch) {
      const escaped = trimmedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      const orConditions: Record<string, unknown>[] = [
        { fullName: regex },
        { email: regex },
        { phone: regex },
        { classGrade: regex },
        { 'profile.schoolName': regex },
        { 'profile.city': regex },
        { 'profile.admissionNumber': regex },
      ];

      if (isValidObjectId(trimmedSearch)) {
        orConditions.push({ _id: new Types.ObjectId(trimmedSearch) });
      }

      filter.$or = orConditions;
    }

    return filter;
  }

  mapStudentListItem(user: {
    _id: { toString(): string };
    fullName: string;
    age?: number;
    gender?: string;
    classGrade?: string;
    schoolId?: { toString(): string } | null;
    email: string;
    phone?: string;
    status: string;
    createdAt?: Date;
    profile?: IUserProfile | null;
  }): IStudentListItem {
    return {
      _id: user._id.toString(),
      fullName: user.fullName,
      age: user.age,
      gender: user.gender,
      classGrade: user.classGrade,
      schoolId: user.schoolId?.toString(),
      schoolName: user.profile?.schoolName,
      city: user.profile?.city,
      admissionNumber: user.profile?.admissionNumber,
      email: user.email,
      phone: user.phone,
      status: user.status,
      createdAt: user.createdAt,
    };
  }

  private mapStudentDetails(user: IUserDocument): IStudentDetails {
    return {
      _id: user._id.toString(),
      fullName: user.fullName,
      age: user.age,
      gender: user.gender,
      classGrade: user.classGrade,
      schoolId: user.schoolId?.toString(),
      schoolName: user.profile?.schoolName,
      city: user.profile?.city,
      admissionNumber: user.profile?.admissionNumber,
      email: user.email,
      phone: user.phone,
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

  private async findActiveSchool(schoolId: string): Promise<IUserDocument> {
    if (!Types.ObjectId.isValid(schoolId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid schoolId');
    }

    const school = await User.findById(schoolId).select(
      'role status fullName profile.institutionName',
    );

    if (!school || school.role !== ROLES.SCHOOL) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'School not found');
    }

    if (school.status !== 'active') {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'School is inactive');
    }

    return school;
  }

  private toRegisteredStudentResponse(user: IUserDocument): IRegisteredStudentResponse {
    return {
      _id: user._id.toString(),
      fullName: user.fullName,
      age: user.age as number,
      gender: user.gender as Gender,
      classGrade: user.classGrade as string,
      role: user.role,
      email: user.email,
      phone: user.phone,
      schoolId: user.schoolId!.toString(),
      status: user.status,
      isVerified: user.isVerified,
      profile: {
        schoolName: user.profile?.schoolName,
        city: user.profile?.city,
        admissionNumber: user.profile?.admissionNumber,
      },
    };
  }
}
