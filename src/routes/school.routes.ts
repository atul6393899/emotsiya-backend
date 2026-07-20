import { Router } from 'express';
import { SchoolController } from '../controllers/school.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validation.middleware';
import { ROLES } from '../constants/roles';
import { schoolStudentListQueryValidation } from '../validations/school.validation';
import { roleEventListQueryValidation } from '../validations/event.validation';

const router = Router();

router.use(authenticate);

router.get(
  '/students',
  authorizeRoles(ROLES.SCHOOL, ROLES.ADMIN),
  validate({ query: schoolStudentListQueryValidation }),
  SchoolController.getStudents,
);

router.get(
  '/events',
  authorizeRoles(ROLES.SCHOOL),
  validate({ query: roleEventListQueryValidation }),
  SchoolController.getEvents,
);

export default router;
