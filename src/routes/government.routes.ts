import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { ROLES } from '../constants/roles';

const router = Router();

router.use(authenticate, authorizeRoles(ROLES.GOVERNMENT));

export default router;
