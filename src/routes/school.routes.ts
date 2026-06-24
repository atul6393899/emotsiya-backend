import { Router } from 'express';
import { SchoolController } from '../controllers/school.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { ROLES } from '../constants/roles';

const router = Router();

router.use(authenticate, authorizeRoles(ROLES.SCHOOL));

router.get('/dashboard', SchoolController.getDashboard);
router.get('/students', SchoolController.getStudents);
router.get('/students/:id', SchoolController.getStudentById);
router.get('/profile', SchoolController.getProfile);
router.put('/profile', SchoolController.updateProfile);

export default router;
