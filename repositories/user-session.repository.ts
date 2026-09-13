import { CreateUserSessionDto } from '@/dto/user-session.dto';
import { buildWhereQuery, TransactionClient } from '@/shared/lib/db';
import { catchAsyncRepository } from '@/shared/lib/error';
import { UserSession } from '@/shared/lib/session';

const returnField = ['id'];

const createUserSessionRepository = catchAsyncRepository(
  async (tx: TransactionClient, inputData: CreateUserSessionDto) => {
    const insertedData = {
      ...inputData,
    };
    const insertQueryRaw = buildWhereQuery<UserSession>({
      tx: tx,
      tableName: 'core.user_session',
    });

    const insertQuery = await insertQueryRaw.insert(insertedData, returnField);
    const data = insertQuery[0];
    return data;
  }
);

const deleteUserSessionByIdRepository = catchAsyncRepository(
  async (tx: TransactionClient, id: string) => {
    const deleteQueryRaw = buildWhereQuery<UserSession>({
      tx: tx,
      tableName: 'core.user_session',
      andCondition: {
        id: id,
      },
    });
    const insertQuery = await deleteQueryRaw.delete(returnField);
    const data = insertQuery[0];
    return data;
  }
);

const deleteUserSessionByUserIdRepository = catchAsyncRepository(
  async (tx: TransactionClient, userId: string) => {
    const deleteQueryRaw = buildWhereQuery<UserSession>({
      tx: tx,
      tableName: 'core.user_session',
      andCondition: {
        userId: userId,
      },
    });
    const insertQuery = await deleteQueryRaw.delete(returnField);
    const data = insertQuery[0];
    return data;
  }
);

export const UserSessionRepository = {
  create: createUserSessionRepository,
  deleteById: deleteUserSessionByIdRepository,
  deleteByUserId: deleteUserSessionByUserIdRepository,
};
