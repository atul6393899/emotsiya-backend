import { Types } from 'mongoose';
import { User, IUserDocument, Gender } from '../models/user.model';
import { ApiError } from '../utils/ApiError';
import { HTTP_STATUS } from '../utils/constants';
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
  status: string;
  isVerified: boolean;
  profile: {
    schoolName?: string;
    city?: string;
  };
}

export interface ISchoolDropdownItem {
  id: string;
  institutionName: string;
}

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
      status: 'pending',
      isVerified: false,
      profile: {
        schoolName,
        city: data.city,
      },
    });

    return this.toRegisteredStudentResponse(student);
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
      status: user.status,
      isVerified: user.isVerified,
      profile: {
        schoolName: user.profile?.schoolName,
        city: user.profile?.city,
      },
    };
  }
}
