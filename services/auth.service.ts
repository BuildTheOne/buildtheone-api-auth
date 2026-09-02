import {
  ChangePasswordDto,
  CreateUserVerification,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
} from '@/dto';
import {
  UserAccountRepository as AccountRepository,
  UserSessionRepository,
  UserVerificationRepository,
} from '@/repositories';
import { Env } from '@/shared/env';
import { EmailService } from '@/shared/lib/email';
import { BadRequestError } from '@/shared/lib/error';
import { compareHash, generateHash } from '@/shared/lib/hash';
import { JwtPayload, signJwt } from '@/shared/lib/jwt';
import { db } from '@/shared/lib/db';
import { RedisService } from '@/shared/lib/redis';
import { UserAccountRepository } from '@/shared/lib/session';
import { Message } from '@/shared/messages';
import { generateRandomString } from '@/shared/utils/string';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';

async function signUpService(inputData: SignUpDto) {
  const signUpData = await db.transaction(async (tx) => {
    const { username, email, password } = inputData;

    const existingUser = await UserAccountRepository.findByCredential(
      tx,
      username,
      email
    );
    if (existingUser) {
      throw new BadRequestError(Message.AUTH.USERNAME_EMAIL_EXISTED);
    }

    const passwordHashed = await generateHash(password);
    const userInputData: SignUpDto = {
      ...inputData,
      password: passwordHashed,
    };

    const newUser = await AccountRepository.create(tx, userInputData);

    return newUser;
  });
  return signUpData;
}

async function signInService(data: SignInDto) {
  const signInData = await db.transaction(async (tx) => {
    const { username, password } = data;
    const user = await UserAccountRepository.findByCredential(tx, username, '');

    if (!user) {
      throw new BadRequestError(Message.AUTH.SIGN_IN_FAILED);
    }

    const isPasswordMatch = await compareHash(password, user.password);
    if (!isPasswordMatch) {
      throw new BadRequestError(Message.AUTH.SIGN_IN_FAILED);
    }

    const sessionId = randomUUID();

    const jwtPayload: JwtPayload = {
      email: user.email,
      sessionId: sessionId,
    };

    const accessSecret = Env.JWT.ACCESS_SECRET!;
    const refreshSecret = Env.JWT.REFRESH_SECRET!;

    const accessToken = await signJwt(
      jwtPayload,
      accessSecret,
      Env.JWT.ACCESS_EXPIRES
    );
    const refreshToken = await signJwt(
      jwtPayload,
      refreshSecret,
      Env.JWT.REFRESH_EXPIRES
    );

    const payload = {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };

    await UserSessionRepository.create(tx, {
      id: sessionId,
      userId: user.id,
      expiredAt: add(new Date(), {
        seconds: Env.JWT.ACCESS_EXPIRES,
      }).toISOString(),
    });
    await AccountRepository.updateLastLogin(tx, user.id);

    const redisSessionKey = `sessionId:${sessionId}`;
    const redisEmailKey = `email:${user.email}`;

    await RedisService.multi()
      .set(redisSessionKey, JSON.stringify(jwtPayload), {
        expiration: {
          type: 'PX',
          value: Env.JWT.ACCESS_EXPIRES,
        },
      })
      .sAdd(redisEmailKey, sessionId)
      .exec();

    return payload;
  });
  return signInData;
}

async function signOutService(sessionId: string) {
  const signOutData = await db.transaction(async (tx) => {
    const data = await UserSessionRepository.deleteById(tx, sessionId);
    await RedisService.del(`sessionId:${sessionId}`);
    return data;
  });
  return signOutData;
}

async function signOutAllService(userId: string, email: string) {
  const signOutData = await db.transaction(async (tx) => {
    const data = await UserSessionRepository.deleteByUserId(tx, userId);
    await clearRedisSession(email);
    return data;
  });
  return signOutData;
}

async function refreshTokenService(userId: string, sessionId: string) {
  const refreshTokenData = await db.transaction(async (tx) => {
    const user = await UserAccountRepository.findById(tx, userId);
    if (!user) {
      throw new BadRequestError(Message.USER.NOT_FOUND);
    }

    const jwtPayload: JwtPayload = {
      email: user.email,
      sessionId: sessionId,
    };

    const accessSecret = Env.JWT.ACCESS_SECRET!;

    const accessToken = await signJwt(
      jwtPayload,
      accessSecret,
      Env.JWT.ACCESS_EXPIRES
    );

    const payload = {
      accessToken: accessToken,
    };

    const redisSessionKey = `sessionId:${sessionId}`;
    await RedisService.multi()
      .set(redisSessionKey, JSON.stringify(jwtPayload), {
        expiration: {
          type: 'PX',
          value: Env.JWT.ACCESS_EXPIRES,
        },
      })
      .exec();

    return payload;
  });
  return refreshTokenData;
}

async function changePasswordService(data: ChangePasswordDto, userId: string) {
  const changePasswordData = await db.transaction(async (tx) => {
    const { oldPassword, newPassword } = data;
    const user = await UserAccountRepository.findById(tx, userId);

    if (!user) {
      throw new BadRequestError();
    }

    const isPasswordMatch = await compareHash(oldPassword, user.password);
    if (!isPasswordMatch) {
      throw new BadRequestError();
    }

    const newPasswordHashed = await generateHash(newPassword);
    const newUserData = await AccountRepository.updatePassword(
      tx,
      userId,
      newPasswordHashed
    );

    await UserSessionRepository.deleteByUserId(tx, userId);

    await clearRedisSession(user.email);

    await EmailService.sendMail({
      to: user.email,
      subject: 'Pemberitahuan Perubahan Kata Sandi',
      filename: 'password-changed',
      ctx: { email: user.email },
    });

    return newUserData;
  });
  return changePasswordData;
}

async function resetPasswordRequestService(credential: string) {
  const resetPasswordRequestData = await db.transaction(async (tx) => {
    const user = await UserAccountRepository.findByCredential(
      tx,
      credential,
      credential
    );
    if (!user) {
      throw new BadRequestError(Message.USER.NOT_FOUND);
    }

    const otpToken = generateRandomString({
      includeUpper: false,
      includeLower: false,
    }) as string;
    const verificationData: CreateUserVerification = {
      userId: user.id,
      token: otpToken,
      type: 'OTP',
    };
    await UserVerificationRepository.create(tx, verificationData);

    await EmailService.sendMail({
      to: user.email,
      subject: 'Permintaan Ubah Kata Sandi',
      filename: 'reset-password-request',
      ctx: {
        email: user.email,
        verificationCode: otpToken,
      },
    });
  });
}

async function verifyResetPasswordRequestService(otpToken?: string) {
  const verifyResetPasswordRequestData = await db.transaction(async (tx) => {
    if (!otpToken) {
      throw new BadRequestError(Message.AUTH.OTP_NOT_FOUND);
    }

    const userVerification = await UserVerificationRepository.findByToken(
      tx,
      otpToken
    );

    if (!userVerification) {
      throw new BadRequestError(Message.AUTH.OTP_NOT_FOUND);
    }

    if (new Date(userVerification.expiredAt) > new Date()) {
      throw new BadRequestError(Message.AUTH.OTP_EXPIRED);
    }
    if (userVerification.isUsed) {
      throw new BadRequestError(Message.AUTH.OTP_ALREADY_USED);
    }
    if (userVerification.isVerified) {
      throw new BadRequestError(Message.AUTH.OTP_ALREADY_USED);
    }

    await UserVerificationRepository.setVerified(tx, otpToken);
  });
  return verifyResetPasswordRequestData;
}

async function resetPasswordService(data: ResetPasswordDto, otpToken?: string) {
  const resetPasswordData = await db.transaction(async (tx) => {
    if (!otpToken) {
      throw new BadRequestError(Message.AUTH.OTP_NOT_FOUND);
    }

    const userVerification = await UserVerificationRepository.findByToken(
      tx,
      otpToken
    );

    if (!userVerification) {
      throw new BadRequestError(Message.AUTH.OTP_NOT_FOUND);
    }
    if (new Date(userVerification.expiredAt) > new Date()) {
      throw new BadRequestError(Message.AUTH.OTP_EXPIRED);
    }
    if (userVerification.isUsed) {
      throw new BadRequestError(Message.AUTH.OTP_ALREADY_USED);
    }
    if (!userVerification.isVerified) {
      throw new BadRequestError(Message.AUTH.OTP_NOT_VERIFIED);
    }

    const newPasswordHashed = await generateHash(data.newPassword);
    const user = await AccountRepository.updatePassword(
      tx,
      userVerification.userId,
      newPasswordHashed
    );

    await UserVerificationRepository.setUsed(tx, otpToken);

    await UserSessionRepository.deleteByUserId(tx, userVerification.userId);

    await clearRedisSession(user.email);

    await EmailService.sendMail({
      to: user.email,
      subject: 'Reset Kata Sandi Berhasil',
      filename: 'password-reset',
      ctx: {
        email: user.email,
      },
    });

    return user;
  });
  return resetPasswordData;
}

export async function clearRedisSession(email: string) {
  const redisEmailKey = `email:${email}`;
  const sessionIds = await RedisService.sMembers(redisEmailKey);

  if (sessionIds.length === 0) return;

  const sessionKeys = sessionIds.map((id) => `sessionId:${id}`);
  await RedisService.multi().del(sessionKeys).del(redisEmailKey).exec();
}

export const AuthService = {
  signUp: signUpService,
  signIn: signInService,
  signOut: signOutService,
  signOutAll: signOutAllService,
  refreshToken: refreshTokenService,
  changePassword: changePasswordService,
  resetPasswordRequest: resetPasswordRequestService,
  verifyResetPasswordRequest: verifyResetPasswordRequestService,
  resetPassword: resetPasswordService,
};
