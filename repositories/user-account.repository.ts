import { SignUpDto } from '@/dto/sign-up.dto';
import { buildWhereQuery, TransactionClient } from '@/shared/lib/db';
import { catchAsyncRepository } from '@/shared/lib/error';
import { UserAccount } from '@/shared/lib/session';
import { randomUUID } from 'crypto';

const returnField = ['id', 'email', 'username', 'displayName'];

const createUserAccountRepository = catchAsyncRepository(
  async (tx: TransactionClient, inputData: SignUpDto) => {
    const insertedData: UserAccount = {
      ...inputData,
      id: randomUUID().toString(),
      isActive: true,
      displayName: inputData.displayName ?? inputData.username,
    };
    const insertQueryRaw = buildWhereQuery<UserAccount>({
      tx: tx,
      tableName: 'core.user_account',
    });

    const insertQuery = await insertQueryRaw.insert(insertedData, returnField);
    const data = insertQuery[0];
    return data;
  }
);

const updateUserAccountLastLoginByIdRepository = catchAsyncRepository(
  async (tx: TransactionClient, id: string) => {
    const updatedData = {
      id: id,
      lastLoginAt: new Date().toISOString(),
      updatedAt: new Date(),
    };

    const updateQueryRaw = buildWhereQuery<UserAccount>({
      tx: tx,
      tableName: 'core.user_account',
      andCondition: {
        id: id,
      },
    });

    const updateQuery = await updateQueryRaw.update(updatedData, returnField);
    const data = updateQuery[0];
    return data;
  }
);

const updateUserAccountPasswordByIdRepository = catchAsyncRepository(
  async (tx: TransactionClient, id: string, password: string) => {
    const updatedData = {
      password: password,
      updatedAt: new Date(),
    };

    const updateQueryRaw = buildWhereQuery<UserAccount>({
      tx: tx,
      tableName: 'core.user_account',
      andCondition: {
        id: id,
      },
    });

    const updateQuery = await updateQueryRaw.update(updatedData, returnField);
    const data = updateQuery[0];
    return data;
  }
);

export const UserAccountRepository = {
  create: createUserAccountRepository,
  updateLastLogin: updateUserAccountLastLoginByIdRepository,
  updatePassword: updateUserAccountPasswordByIdRepository,
};
