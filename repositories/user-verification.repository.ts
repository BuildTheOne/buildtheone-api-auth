import { CreateUserVerification } from '@/dto/user-verification.dto';
import { userVerificationInCore } from '@/shared/db/schema';
import { buildWhereClause, TransactionClient } from '@/shared/lib/db';
import { catchAsyncRepository } from '@/shared/lib/error';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import { eq } from 'drizzle-orm';

const findUserVerificationByTokenRepository = catchAsyncRepository(
  async (tx: TransactionClient, token: string) => {
    const whereClause = buildWhereClause({
      table: userVerificationInCore,
      andClause: [eq(userVerificationInCore.token, token)],
    });
    const data = await tx
      .select()
      .from(userVerificationInCore)
      .where(whereClause);
    return data[0];
  }
);

const createUserVerificationRepository = catchAsyncRepository(
  async (tx: TransactionClient, inputData: CreateUserVerification) => {
    const data = await tx
      .insert(userVerificationInCore)
      .values({
        ...inputData,
        id: randomUUID(),
        expiredAt: add(new Date(), { minutes: 3 }).toISOString(),
        isUsed: false,
      })
      .returning();
    return data[0];
  }
);

const setUserVerificationVerifiedRepository = catchAsyncRepository(
  async (tx: TransactionClient, token: string) => {
    const whereClause = buildWhereClause({
      table: userVerificationInCore,
      andClause: [eq(userVerificationInCore.token, token)],
    });

    const data = await tx
      .update(userVerificationInCore)
      .set({
        isVerified: true,
      })
      .where(whereClause)
      .returning();
    return data[0];
  }
);

const setUserVerificationUsedRepository = catchAsyncRepository(
  async (tx: TransactionClient, token: string) => {
    const whereClause = buildWhereClause({
      table: userVerificationInCore,
      andClause: [eq(userVerificationInCore.token, token)],
    });

    const data = await tx
      .update(userVerificationInCore)
      .set({
        isUsed: true,
      })
      .where(whereClause)
      .returning();
    return data[0];
  }
);

export const UserVerificationRepository = {
  findByToken: findUserVerificationByTokenRepository,
  create: createUserVerificationRepository,
  setVerified: setUserVerificationVerifiedRepository,
  setUsed: setUserVerificationUsedRepository,
};
