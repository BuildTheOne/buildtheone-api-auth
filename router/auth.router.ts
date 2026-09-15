import { AuthController } from '@/controllers';
import {
  changePasswordSchema,
  resetPasswordRequestSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from '@/dto';
import { sessionMiddleware } from '@/shared/lib/session';
import { Route } from '@/shared/routes';
import { validateForm } from '@/shared/utils/validation';
import { Router } from 'express';

const authRouter = Router();

authRouter.post(
  Route.sign_up,
  validateForm(signUpSchema),
  AuthController.signUp
);
authRouter.post(
  Route.sign_in,
  validateForm(signInSchema),
  AuthController.signIn
);
authRouter.post(Route.sign_out, sessionMiddleware, AuthController.signOut);
authRouter.post(
  Route.sign_out_all,
  sessionMiddleware,
  AuthController.signOutAll
);
authRouter.post(Route.refresh_token, AuthController.refreshToken);
authRouter.post(
  Route.change_password,
  sessionMiddleware,
  validateForm(changePasswordSchema),
  AuthController.changePassword
);
authRouter.post(
  Route.reset_password_request,
  validateForm(resetPasswordRequestSchema),
  AuthController.resetPasswordRequest
);
authRouter.post(
  Route.verify_reset_password_request,
  AuthController.verifyResetPasswordRequest
);
authRouter.post(
  Route.reset_password,
  validateForm(resetPasswordSchema),
  AuthController.resetPassword
);

export { authRouter };
