import { CreateUserVerification } from '@/dto/user-verification.dto';
import { buildWhereQuery, TransactionClient } from '@/shared/lib/db';
import { catchAsyncRepository } from '@/shared/lib/error';
import { UserVerification } from '@/types';
import { add } from 'date-fns';

const returnField = ['id', 'expiredAt', 'isVerified', 'isUsed'];

const findUserVerificationByTokenRepository = catchAsyncRepository(
  async (tx: TransactionClient, token: string) => {
    const dataQueryRaw = buildWhereQuery<UserVerification>({
      tx: tx,
      tableName: 'core.user_verification',
      andCondition: {
        token: token,
      },
    });
    const dataQuery = await dataQueryRaw.first(...returnField);
    const data = dataQuery;
    return data;
  }
);

const createUserVerificationRepository = catchAsyncRepository(
  async (tx: TransactionClient, inputData: CreateUserVerification) => {
    const insertedData = {
      ...inputData,
      expiredAt: add(new Date(), { minutes: 3 }).toISOString(),
      isUsed: false,
    };
    const insertQueryRaw = buildWhereQuery<UserVerification>({
      tx: tx,
      tableName: 'core.user_verification',
    });

    const insertQuery = await insertQueryRaw.insert(insertedData, returnField);
    const data = insertQuery[0];
    return data;
  }
);

const setUserVerificationVerifiedRepository = catchAsyncRepository(
  async (tx: TransactionClient, token: string) => {
    const updatedData = {
      isVerified: true,
      updatedAt: new Date(),
    };

    const updateQueryRaw = buildWhereQuery<UserVerification>({
      tx: tx,
      tableName: 'core.user_verification',
      andCondition: {
        token: token,
      },
    });
    const updateQuery = await updateQueryRaw.update(updatedData, returnField);
    const data = updateQuery[0];
    return data;
  }
);

const setUserVerificationUsedRepository = catchAsyncRepository(
  async (tx: TransactionClient, token: string) => {
    const updatedData = {
      isUsed: true,
      updatedAt: new Date(),
    };

    const updateQueryRaw = buildWhereQuery<UserVerification>({
      tx: tx,
      tableName: 'core.user_verification',
      andCondition: {
        token: token,
      },
    });
    const updateQuery = await updateQueryRaw.update(updatedData, returnField);
    const data = updateQuery[0];
    return data;
  }
);

export const UserVerificationRepository = {
  findByToken: findUserVerificationByTokenRepository,
  create: createUserVerificationRepository,
  setVerified: setUserVerificationVerifiedRepository,
  setUsed: setUserVerificationUsedRepository,
};
