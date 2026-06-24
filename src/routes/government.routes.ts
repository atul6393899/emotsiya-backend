import { Router } from 'express';
import { GovernmentController } from '../controllers/government.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { ROLES } from '../constants/roles';

const router = Router();

router.use(authenticate, authorizeRoles(ROLES.GOVERNMENT));

router.get('/dashboard', GovernmentController.getDashboard);
router.get('/users', GovernmentController.getAllUsers);
router.get('/schools', GovernmentController.getSchools);
router.get('/profile', GovernmentController.getProfile);

export default router;
