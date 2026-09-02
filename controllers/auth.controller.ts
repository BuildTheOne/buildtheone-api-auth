import {
  ChangePasswordDto,
  ResetPasswordDto,
  ResetPasswordRequestDto,
  SignInDto,
  SignUpDto,
} from '@/dto';
import { AuthService } from '@/services';
import { HttpStatus } from '@/shared/constants/http-status';
import { Env } from '@/shared/env';
import { catchAsyncController } from '@/shared/lib/error';
import { getSessionData } from '@/shared/lib/session';
import { Message } from '@/shared/messages';
import { ResponseHandler } from '@/shared/response';
import { Response } from 'express';

const signUpController = catchAsyncController(async (req, res) => {
  const data = req.body as SignUpDto;
  await AuthService.signUp(data);
  ResponseHandler({
    req,
    res,
    statusCode: HttpStatus.OK,
    message: Message.AUTH.SIGN_UP_SUCCESS,
  });
});

const signInController = catchAsyncController(async (req, res) => {
  const data = req.body as SignInDto;
  const signInData = await AuthService.signIn(data);

  res.cookie('accessToken', signInData.accessToken, {
    httpOnly: true,
    secure: false,
    maxAge: Env.JWT.ACCESS_EXPIRES,
    path: '/',
  });
  res.cookie('refreshToken', signInData.refreshToken, {
    httpOnly: true,
    secure: false,
    maxAge: Env.JWT.REFRESH_EXPIRES,
    path: '/',
  });

  ResponseHandler({
    req,
    res,
    statusCode: HttpStatus.OK,
    message: Message.AUTH.SIGN_IN_SUCCESS,
    data: signInData,
  });
});

const signOutController = catchAsyncController(async (req, res) => {
  const { session } = await getSessionData(req);
  await AuthService.signOut(session.id);
  clearCookie(res);
  ResponseHandler({
    req,
    res,
    statusCode: HttpStatus.OK,
    message: Message.AUTH.SIGN_OUT_SUCCESS,
  });
});

const signOutAllController = catchAsyncController(async (req, res) => {
  const { user } = await getSessionData(req);
  await AuthService.signOutAll(user.id, user.email);
  clearCookie(res);
  ResponseHandler({
    req,
    res,
    statusCode: HttpStatus.OK,
    message: Message.AUTH.SIGN_OUT_SUCCESS,
  });
});

const refreshTokenController = catchAsyncController(async (req, res) => {
  const { user, session } = await getSessionData(req, 'REFRESH');
  const refreshTokenData = await AuthService.refreshToken(user.id, session.id);
  res.cookie('accessToken', refreshTokenData.accessToken, {
    httpOnly: true,
    secure: false,
    maxAge: Env.JWT.ACCESS_EXPIRES,
    path: '/',
  });
  ResponseHandler({
    req,
    res,
    statusCode: HttpStatus.OK,
    message: Message.AUTH.TOKEN_REFRESHED,
  });
});

const changePasswordController = catchAsyncController(async (req, res) => {
  const { session } = await getSessionData(req);
  const data = req.body as ChangePasswordDto;
  await AuthService.changePassword(data, session.userId);
  clearCookie(res);
  ResponseHandler({
    req,
    res,
    statusCode: HttpStatus.OK,
    message: Message.AUTH.PASSWORD_CHANGED,
  });
});

const resetPasswordRequestController = catchAsyncController(
  async (req, res) => {
    const { payload } = req.body as ResetPasswordRequestDto;
    await AuthService.resetPasswordRequest(payload);
    clearCookie(res);
    ResponseHandler({
      req,
      res,
      statusCode: HttpStatus.OK,
      message: Message.AUTH.RESET_PASSWORD_REQUEST_EMAIL_SENT,
    });
  }
);

const verifyResetPasswordRequestController = catchAsyncController(
  async (req, res) => {
    const otpToken = req.headers[Env.OTP_SECRET ?? ''] as string | undefined;
    await AuthService.verifyResetPasswordRequest(otpToken);
    clearCookie(res);
    ResponseHandler({
      req,
      res,
      statusCode: HttpStatus.OK,
      message: Message.SUCCESS,
    });
  }
);

const resetPasswordController = catchAsyncController(async (req, res) => {
  const otpToken = req.headers[Env.OTP_SECRET ?? ''] as string | undefined;
  const data = req.body as ResetPasswordDto;
  await AuthService.resetPassword(data, otpToken);
  clearCookie(res);
  ResponseHandler({
    req,
    res,
    statusCode: HttpStatus.OK,
    message: Message.AUTH.PASSWORD_RESET,
  });
});

const clearCookie = (res: Response) => {
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: false,
    path: '/',
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: false,
    path: '/',
  });
};

export const AuthController = {
  signUp: signUpController,
  signIn: signInController,
  signOut: signOutController,
  signOutAll: signOutAllController,
  refreshToken: refreshTokenController,
  changePassword: changePasswordController,
  resetPasswordRequest: resetPasswordRequestController,
  verifyResetPasswordRequest: verifyResetPasswordRequestController,
  resetPassword: resetPasswordController,
};
