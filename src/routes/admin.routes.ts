import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validation.middleware';
import { ROLES } from '../constants/roles';
import {
  createSchoolValidation,
  createGovernmentValidation,
  approveUserParamsValidation,
  onboardingListQueryValidation,
} from '../validations/admin.validation';

const router = Router();

router.use(authenticate, authorizeRoles(ROLES.ADMIN));

router.get('/onboarding/dashboard', AdminController.getOnboardingDashboardSummary);
router.get(
  '/onboarding/schools',
  validate({ query: onboardingListQueryValidation }),
  AdminController.getOnboardingSchools,
);
router.get(
  '/onboarding/governments',
  validate({ query: onboardingListQueryValidation }),
  AdminController.getOnboardingGovernments,
);

router.post('/schools', validate({ body: createSchoolValidation }), AdminController.createSchool);
router.get(
  '/schools/:id',
  validate({ params: approveUserParamsValidation }),
  AdminController.getSchoolById,
);
router.patch(
  '/schools/:id/approve',
  validate({ params: approveUserParamsValidation }),
  AdminController.approveSchool,
);

router.post(
  '/governments',
  validate({ body: createGovernmentValidation }),
  AdminController.createGovernment,
);
router.get(
  '/governments/:id',
  validate({ params: approveUserParamsValidation }),
  AdminController.getGovernmentById,
);
router.patch(
  '/governments/:id/approve',
  validate({ params: approveUserParamsValidation }),
  AdminController.approveGovernment,
);

export default router;
