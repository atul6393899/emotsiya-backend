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

// ──────────── Student: missions of the student's school events ────────────
// Declared before the admin guard below so it is scoped to STUDENT.
router.get(
  '/student',
  authenticate,
  authorizeRoles(ROLES.STUDENT),
  validate({ query: missionListQueryValidation }),
  MissionController.getStudentMissions,
);

// ──────────── Admin Mission CRUD ────────────
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
