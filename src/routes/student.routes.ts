import { Router } from 'express';
import { StudentController } from '../controllers/student.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validation.middleware';
import { ROLES } from '../constants/roles';
import {
  registerStudentValidation,
  studentListQueryValidation,
  studentIdParamsValidation,
} from '../validations/student.validation';
import { roleEventListQueryValidation } from '../validations/event.validation';

const router = Router();

router.post(
  '/register',
  validate({ body: registerStudentValidation }),
  StudentController.registerStudent,
);
router.get('/schools', StudentController.getSchoolDropdown);

router.get(
  '/events',
  authenticate,
  authorizeRoles(ROLES.STUDENT),
  validate({ query: roleEventListQueryValidation }),
  StudentController.getEvents,
);

router.get(
  '/',
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.STUDENT, ROLES.SCHOOL),
  validate({ query: studentListQueryValidation }),
  StudentController.getStudents,
);
router.get(
  '/:id',
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.STUDENT, ROLES.SCHOOL),
  validate({ params: studentIdParamsValidation }),
  StudentController.getStudentById,
);
router.patch(
  '/:id/approve',
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.SCHOOL),
  validate({ params: studentIdParamsValidation }),
  StudentController.approveStudent,
);

export default router;
