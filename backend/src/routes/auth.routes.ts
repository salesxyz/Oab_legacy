import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { authRateLimiter } from '../middlewares/rateLimiter.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema,
  verifyCodeSchema,
} from '../schemas/auth.schema';

const router = Router();

router.post('/register', authRateLimiter, validate({ body: registerSchema }), authController.register);
router.post('/login', authRateLimiter, validate({ body: loginSchema }), authController.login);
router.post('/refresh', validate({ body: refreshSchema }), authController.refresh);
router.post('/logout', validate({ body: refreshSchema }), authController.logout);
router.post('/logout-all', authMiddleware, authController.logoutAll);

router.post('/forgot-password', authRateLimiter, validate({ body: forgotPasswordSchema }), authController.forgotPassword);
router.post('/verify-code', authRateLimiter, validate({ body: verifyCodeSchema }), authController.verifyCode);
router.post('/reset-password', authRateLimiter, validate({ body: resetPasswordSchema }), authController.resetPassword);
router.post(
  '/change-password',
  authMiddleware,
  validate({ body: changePasswordSchema }),
  authController.changePassword,
);

export default router;
