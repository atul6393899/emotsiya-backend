import { Router } from 'express';
import { ExpertSessionController } from '../controllers/expertSession.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validation.middleware';
import { ROLES } from '../constants/roles';
import {
  createExpertSessionValidation,
  updateExpertSessionValidation,
  expertSessionIdParamsValidation,
  expertSessionListQueryValidation,
  joinExpertSessionValidation,
  expertSessionParticipantsQueryValidation,
} from '../validations/expertSession.validation';

const router = Router();

router.use(authenticate);

const ALL_ROLES = [ROLES.ADMIN, ROLES.SCHOOL, ROLES.GOVERNMENT, ROLES.STUDENT];

// Create — admin only.
router.post(
  '/',
  authorizeRoles(ROLES.ADMIN),
  validate({ body: createExpertSessionValidation }),
  ExpertSessionController.createExpertSession,
);

// List — all authenticated roles (non-admins are scoped to active sessions in the service).
router.get(
  '/',
  authorizeRoles(...ALL_ROLES),
  validate({ query: expertSessionListQueryValidation }),
  ExpertSessionController.getExpertSessions,
);

// Join-related routes (declared before /:id to keep path matching clear).
router.post(
  '/:id/join',
  authorizeRoles(...ALL_ROLES),
  validate({ params: joinExpertSessionValidation }),
  ExpertSessionController.joinExpertSession,
);

router.get(
  '/:id/join-count',
  authorizeRoles(...ALL_ROLES),
  validate({ params: joinExpertSessionValidation }),
  ExpertSessionController.getExpertSessionJoinCount,
);

router.get(
  '/:id/participants',
  authorizeRoles(ROLES.ADMIN),
  validate({
    params: joinExpertSessionValidation,
    query: expertSessionParticipantsQueryValidation,
  }),
  ExpertSessionController.getExpertSessionParticipants,
);

// Details — all authenticated roles.
router.get(
  '/:id',
  authorizeRoles(...ALL_ROLES),
  validate({ params: expertSessionIdParamsValidation }),
  ExpertSessionController.getExpertSessionById,
);

// Update — admin only.
router.put(
  '/:id',
  authorizeRoles(ROLES.ADMIN),
  validate({
    params: expertSessionIdParamsValidation,
    body: updateExpertSessionValidation,
  }),
  ExpertSessionController.updateExpertSession,
);

// Delete — admin only.
router.delete(
  '/:id',
  authorizeRoles(ROLES.ADMIN),
  validate({ params: expertSessionIdParamsValidation }),
  ExpertSessionController.deleteExpertSession,
);

export default router;
