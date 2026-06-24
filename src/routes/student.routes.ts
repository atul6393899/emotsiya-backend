import { Router } from 'express';
import { StudentController } from '../controllers/student.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { ROLES } from '../constants/roles';

const router = Router();

router.use(authenticate, authorizeRoles(ROLES.STUDENT));

router.get('/dashboard', StudentController.getDashboard);
router.get('/profile', StudentController.getProfile);
router.put('/profile', StudentController.updateProfile);

export default router;
