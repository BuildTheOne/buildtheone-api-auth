import { SignUpDto } from '@/dto/sign-up.dto';
import { catchAsyncRepository } from '@/shared/lib/error';
import { TransactionClient } from '@/shared/lib/db';
import { UserAccount } from '@/shared/lib/session';
import { randomUUID } from 'crypto';

const createUserAccountRepository = catchAsyncRepository(
  async (tx: TransactionClient, inputData: SignUpDto) => {
    const insertedData: UserAccount = {
      ...inputData,
      id: randomUUID().toString(),
      isActive: true,
      displayName: inputData.displayName ?? inputData.username,
    };
    const query = await tx<UserAccount>('core.user_account').insert(
      insertedData,
      ['id', 'email', 'username', 'displayName']
    );
    return query[0];
  }
);

const updateUserAccountLastLoginByIdRepository = catchAsyncRepository(
  async (tx: TransactionClient, id: string) => {
    const query = await tx<UserAccount>('core.user_account')
      .update('lastLoginAt', new Date(), [
        'id',
        'email',
        'username',
        'displayName',
      ])
      .where('id', id);
    return query[0];
  }
);

const updateUserAccountPasswordByIdRepository = catchAsyncRepository(
  async (tx: TransactionClient, id: string, password: string) => {
    const query = await tx<UserAccount>('core.user_account')
      .update('password', password, ['id', 'email', 'username', 'displayName'])
      .where('id', id);
    return query[0];
  }
);

export const UserAccountRepository = {
  create: createUserAccountRepository,
  updateLastLogin: updateUserAccountLastLoginByIdRepository,
  updatePassword: updateUserAccountPasswordByIdRepository,
};
