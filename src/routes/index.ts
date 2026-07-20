import { Router } from 'express';
import authRoutes from './auth.routes';
import adminRoutes from './admin.routes';
import schoolRoutes from './school.routes';
import governmentRoutes from './government.routes';
import studentRoutes from './student.routes';
import eventCategoryRoutes from './eventcategory.routes';
import eventRoutes from './event.routes';
import missionRoutes from './mission.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/school', schoolRoutes);
router.use('/government', governmentRoutes);
router.use('/student', studentRoutes);
router.use('/event-categories', eventCategoryRoutes);
router.use('/events', eventRoutes);
router.use('/missions', missionRoutes);

export default router;
