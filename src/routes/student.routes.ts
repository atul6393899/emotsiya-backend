import { Router } from 'express';
import { StudentController } from '../controllers/student.controller';
import { validate } from '../middlewares/validation.middleware';
import { registerStudentValidation } from '../validations/student.validation';

const router = Router();

router.post(
  '/register',
  validate({ body: registerStudentValidation }),
  StudentController.registerStudent,
);
router.get('/schools', StudentController.getSchoolDropdown);

export default router;
