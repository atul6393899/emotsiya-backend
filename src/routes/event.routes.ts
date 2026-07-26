import { Router } from 'express';
import { EventController } from '../controllers/event.controller';
import { MissionController } from '../controllers/mission.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validation.middleware';
import { ROLES } from '../constants/roles';
import {
  createEventValidation,
  updateEventValidation,
  eventIdParamsValidation,
  eventListQueryValidation,
  joinEventValidation,
} from '../validations/event.validation';
import { missionEventDropdownQueryValidation } from '../validations/mission.validation';

const router = Router();

// ──────────── Student Event Participation (student only) ────────────
// Declared before the admin guard below so they are scoped to STUDENT.
router.get(
  '/student/events',
  authenticate,
  authorizeRoles(ROLES.STUDENT),
  EventController.getStudentEvents,
);

router.get(
  '/student/events/my-events',
  authenticate,
  authorizeRoles(ROLES.STUDENT),
  EventController.getMyJoinedEvents,
);

router.post(
  '/student/events/:id/join',
  authenticate,
  authorizeRoles(ROLES.STUDENT),
  validate({ params: joinEventValidation }),
  EventController.joinEvent,
);

// ──────────── Admin Event CRUD (unchanged) ────────────
router.use(authenticate, authorizeRoles(ROLES.ADMIN));

router.get(
  '/mission-dropdown',
  validate({ query: missionEventDropdownQueryValidation }),
  MissionController.getMissionEventDropdown,
);

router.post('/', validate({ body: createEventValidation }), EventController.createEvent);
router.get('/', validate({ query: eventListQueryValidation }), EventController.getEvents);
router.get('/:id', validate({ params: eventIdParamsValidation }), EventController.getEventById);
router.put(
  '/:id',
  validate({ params: eventIdParamsValidation, body: updateEventValidation }),
  EventController.updateEvent,
);
router.delete('/:id', validate({ params: eventIdParamsValidation }), EventController.deleteEvent);

export default router;
