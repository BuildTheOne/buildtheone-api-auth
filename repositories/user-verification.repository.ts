import { CreateUserVerification } from '@/dto/user-verification.dto';
import { TransactionClient } from '@/shared/lib/db';
import { catchAsyncRepository } from '@/shared/lib/error';
import { UserVerification } from '@/types';
import { add } from 'date-fns';

const findUserVerificationByTokenRepository = catchAsyncRepository(
  async (tx: TransactionClient, token: string) => {
    const query = await tx<UserVerification>('core.user_verification')
      .where('token', token)
      .first();
    return query;
  }
);

const createUserVerificationRepository = catchAsyncRepository(
  async (tx: TransactionClient, inputData: CreateUserVerification) => {
    const insertedData = {
      ...inputData,
      expiredAt: add(new Date(), { minutes: 3 }).toISOString(),
      isUsed: false,
    };
    const data = await tx<UserVerification>('core.user_verification').insert(
      insertedData,
      ['id']
    );
    return data[0];
  }
);

const setUserVerificationVerifiedRepository = catchAsyncRepository(
  async (tx: TransactionClient, token: string) => {
    const data = await tx<UserVerification>('core.user_verification').update(
      'isVerified',
      true,
      ['id']
    );
    return data[0];
  }
);

const setUserVerificationUsedRepository = catchAsyncRepository(
  async (tx: TransactionClient, token: string) => {
    const data = await tx<UserVerification>('core.user_verification').update(
      'isUsed',
      true,
      ['id']
    );
    return data[0];
  }
);

export const UserVerificationRepository = {
  findByToken: findUserVerificationByTokenRepository,
  create: createUserVerificationRepository,
  setVerified: setUserVerificationVerifiedRepository,
  setUsed: setUserVerificationUsedRepository,
};
