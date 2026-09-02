import { AuthController } from '@/controllers';
import {
  changePasswordSchema,
  resetPasswordRequestSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from '@/dto';
import { sessionMiddleware } from '@/shared/lib/session';
import { ServerRoute } from '@/shared/routes';
import { validateForm } from '@/shared/utils/validation';
import { Router } from 'express';

const authRouter = Router();

authRouter.post(
  ServerRoute.sign_up,
  validateForm(signUpSchema),
  AuthController.signUp
);
authRouter.post(
  ServerRoute.sign_in,
  validateForm(signInSchema),
  AuthController.signIn
);
authRouter.post(
  ServerRoute.sign_out,
  sessionMiddleware,
  AuthController.signOut
);
authRouter.post(
  ServerRoute.sign_out_all,
  sessionMiddleware,
  AuthController.signOutAll
);
authRouter.post(ServerRoute.refresh_token, AuthController.refreshToken);
authRouter.post(
  ServerRoute.change_password,
  sessionMiddleware,
  validateForm(changePasswordSchema),
  AuthController.changePassword
);
authRouter.post(
  ServerRoute.reset_password_request,
  validateForm(resetPasswordRequestSchema),
  AuthController.resetPasswordRequest
);
authRouter.post(
  ServerRoute.verify_reset_password_request,
  AuthController.verifyResetPasswordRequest
);
authRouter.post(
  ServerRoute.reset_password,
  validateForm(resetPasswordSchema),
  AuthController.resetPassword
);

export { authRouter };
