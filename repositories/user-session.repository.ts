import { CreateUserSessionDto } from '@/dto/user-session.dto';
import { userSessionInCore } from '@/shared/db/schema';
import { TransactionClient } from '@/shared/lib/db';
import { catchAsyncRepository } from '@/shared/lib/error';
import { eq } from 'drizzle-orm';

const createUserSessionRepository = catchAsyncRepository(
  async (tx: TransactionClient, inputData: CreateUserSessionDto) => {
    const data = await tx.insert(userSessionInCore).values(inputData);
    return data;
  }
);

const deleteUserSessionByIdRepository = catchAsyncRepository(
  async (tx: TransactionClient, sessionId: string) => {
    const data = await tx
      .delete(userSessionInCore)
      .where(eq(userSessionInCore.id, sessionId))
      .returning();
    return data[0];
  }
);

const deleteUserSessionByUserIdRepository = catchAsyncRepository(
  async (tx: TransactionClient, userId: string) => {
    const data = await tx
      .delete(userSessionInCore)
      .where(eq(userSessionInCore.userId, userId))
      .returning();
    return data[0];
  }
);

export const UserSessionRepository = {
  create: createUserSessionRepository,
  deleteById: deleteUserSessionByIdRepository,
  deleteByUserId: deleteUserSessionByUserIdRepository,
};
