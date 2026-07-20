import { Router } from 'express';
import { EventCategoryController } from '../controllers/eventcategory.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validation.middleware';
import { ROLES } from '../constants/roles';
import {
  createCategoryValidation,
  updateCategoryValidation,
  updateCategoryStatusValidation,
  categoryIdParamsValidation,
  categoryListQueryValidation,
} from '../validations/eventcategory.validation';

const router = Router();

// Dropdown for event creation — any authenticated user
router.get('/dropdown', authenticate, EventCategoryController.getDropdown);

// Admin-only category management
router.use(authenticate, authorizeRoles(ROLES.ADMIN));

router.post(
  '/',
  validate({ body: createCategoryValidation }),
  EventCategoryController.createCategory,
);
router.get(
  '/',
  validate({ query: categoryListQueryValidation }),
  EventCategoryController.getCategories,
);
router.get(
  '/:id',
  validate({ params: categoryIdParamsValidation }),
  EventCategoryController.getCategoryById,
);
router.put(
  '/:id',
  validate({ params: categoryIdParamsValidation, body: updateCategoryValidation }),
  EventCategoryController.updateCategory,
);
router.patch(
  '/:id/status',
  validate({ params: categoryIdParamsValidation, body: updateCategoryStatusValidation }),
  EventCategoryController.updateCategoryStatus,
);
router.delete(
  '/:id',
  validate({ params: categoryIdParamsValidation }),
  EventCategoryController.deleteCategory,
);

export default router;
