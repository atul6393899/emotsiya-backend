import { Router } from 'express';
import { GovernmentController } from '../controllers/government.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validation.middleware';
import { ROLES } from '../constants/roles';
import {
  roleEventListQueryValidation,
  governmentDropdownQueryValidation,
  governmentSchoolsQueryValidation,
} from '../validations/event.validation';

const router = Router();

router.get(
  '/dropdown',
  authenticate,
  validate({ query: governmentDropdownQueryValidation }),
  GovernmentController.getDropdown,
);

router.get(
  '/schools',
  authenticate,
  authorizeRoles(ROLES.GOVERNMENT),
  validate({ query: governmentSchoolsQueryValidation }),
  GovernmentController.getSchools,
);

router.get(
  '/events',
  authenticate,
  authorizeRoles(ROLES.GOVERNMENT),
  validate({ query: roleEventListQueryValidation }),
  GovernmentController.getEvents,
);

export default router;
