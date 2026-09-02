import { CreateUserSessionDto } from '@/dto/user-session.dto';
import { catchAsyncRepository } from '@/shared/lib/error';
import { TransactionClient } from '@/shared/lib/db';
import { UserSession } from '@/shared/lib/session';

const createUserSessionRepository = catchAsyncRepository(
  async (tx: TransactionClient, inputData: CreateUserSessionDto) => {
    const query = await tx<UserSession>('core.user_session').insert(inputData, [
      'id',
    ]);
    return query[0];
  }
);

const deleteUserSessionByIdRepository = catchAsyncRepository(
  async (tx: TransactionClient, id: string) => {
    const query = await tx<UserSession>('core.user_session')
      .delete(['id'])
      .andWhere('id', id);
    return query[0];
  }
);

const deleteUserSessionByUserIdRepository = catchAsyncRepository(
  async (tx: TransactionClient, userId: string) => {
    const query = await tx<UserSession>('core.user_session')
      .delete(['id'])
      .andWhere('userId', userId);
    return query[0];
  }
);

export const UserSessionRepository = {
  create: createUserSessionRepository,
  deleteById: deleteUserSessionByIdRepository,
  deleteByUserId: deleteUserSessionByUserIdRepository,
};
