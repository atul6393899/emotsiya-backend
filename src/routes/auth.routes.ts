import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { otpRateLimiter } from '../middlewares/rateLimit.middleware';
import { sendOtpSchema, resendOtpSchema, verifyOtpSchema } from '../validations/auth.validation';

const router = Router();

router.post('/send-otp', otpRateLimiter, validate({ body: sendOtpSchema }), AuthController.sendOtp);
router.post(
  '/re-send-otp',
  otpRateLimiter,
  validate({ body: resendOtpSchema }),
  AuthController.resendOtp,
);
router.post('/verify-otp', validate({ body: verifyOtpSchema }), AuthController.verifyOtp);
router.post('/logout', authenticate, AuthController.logout);

export default router;
