import { Router } from 'express';
import { MissionController } from '../controllers/mission.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validation.middleware';
import { ROLES } from '../constants/roles';
import {
  createMissionValidation,
  updateMissionValidation,
  missionIdParamsValidation,
  missionListQueryValidation,
} from '../validations/mission.validation';

const router = Router();

router.use(authenticate, authorizeRoles(ROLES.ADMIN));

router.post('/', validate({ body: createMissionValidation }), MissionController.createMission);
router.get('/', validate({ query: missionListQueryValidation }), MissionController.getMissions);
router.get(
  '/:id',
  validate({ params: missionIdParamsValidation }),
  MissionController.getMissionById,
);
router.put(
  '/:id',
  validate({ params: missionIdParamsValidation, body: updateMissionValidation }),
  MissionController.updateMission,
);
router.delete(
  '/:id',
  validate({ params: missionIdParamsValidation }),
  MissionController.deleteMission,
);

export default router;
