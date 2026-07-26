import { Router } from 'express';
import { TaskSubmissionController } from '../controllers/taskSubmission.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validation.middleware';
import { uploadImageToS3 } from '../middlewares/upload.middleware';
import { ROLES } from '../constants/roles';
import {
  submitTaskValidation,
  reviewTaskSubmissionValidation,
  taskSubmissionIdParamsValidation,
  taskSubmissionListQueryValidation,
} from '../validations/taskSubmission.validation';

const router = Router();

router.use(authenticate);

// Student submits a task. The proof image is uploaded to S3 (multipart field `proof`)
// and its metadata is attached to req.body.proof before validation.
router.post(
  '/',
  authorizeRoles(ROLES.STUDENT),
  uploadImageToS3('proof', 'task-submissions'),
  validate({ body: submitTaskValidation }),
  TaskSubmissionController.submitTask,
);

// Admin, School and Student can list submissions (scoped by role in the service).
router.get(
  '/',
  authorizeRoles(ROLES.ADMIN, ROLES.SCHOOL, ROLES.STUDENT),
  validate({ query: taskSubmissionListQueryValidation }),
  TaskSubmissionController.getTaskSubmissions,
);

router.get(
  '/:id',
  authorizeRoles(ROLES.ADMIN, ROLES.SCHOOL, ROLES.STUDENT),
  validate({ params: taskSubmissionIdParamsValidation }),
  TaskSubmissionController.getTaskSubmissionById,
);

// School reviews a submission made by one of its students.
router.patch(
  '/:id/review',
  authorizeRoles(ROLES.SCHOOL),
  validate({
    params: taskSubmissionIdParamsValidation,
    body: reviewTaskSubmissionValidation,
  }),
  TaskSubmissionController.reviewTaskSubmission,
);

export default router;
