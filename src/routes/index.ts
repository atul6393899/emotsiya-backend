import { Router } from 'express';
import authRoutes from './auth.routes';
import adminRoutes from './admin.routes';
import schoolRoutes from './school.routes';
import governmentRoutes from './government.routes';
import studentRoutes from './student.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/school', schoolRoutes);
router.use('/government', governmentRoutes);
router.use('/student', studentRoutes);

export default router;
