import { Request, Response, NextFunction } from 'express';
import { StudentService } from '../services/student.service';
import { ApiResponse } from '../utils/ApiResponse';

const studentService = new StudentService();

export class StudentController {
  static registerStudent = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const student = await studentService.registerStudent(req.body);
      ApiResponse.created(res, student, 'Student registered successfully.');
    } catch (error) {
      next(error);
    }
  };

  static getSchoolDropdown = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const schools = await studentService.getSchoolDropdown();
      ApiResponse.success(res, schools, 'Schools fetched successfully');
    } catch (error) {
      next(error);
    }
  };
}
