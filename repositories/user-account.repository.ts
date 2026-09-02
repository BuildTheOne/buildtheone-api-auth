import { SignUpDto } from '@/dto/sign-up.dto';
import { userAccountInCore } from '@/shared/db/schema';
import { buildWhereClause, TransactionClient } from '@/shared/lib/db';
import { catchAsyncRepository } from '@/shared/lib/error';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';

const createUserAccountRepository = catchAsyncRepository(
  async (tx: TransactionClient, inputData: SignUpDto) => {
    const data = await tx
      .insert(userAccountInCore)
      .values({
        ...inputData,
        id: randomUUID().toString(),
        isActive: true,
        displayName: inputData.displayName ?? inputData.username,
      })
      .returning();
    return data[0];
  }
);

const updateUserAccountLastLoginByIdRepository = catchAsyncRepository(
  async (tx: TransactionClient, userId: string) => {
    const whereClause = buildWhereClause({
      table: userAccountInCore,
      andClause: [
        eq(userAccountInCore.isActive, true),
        eq(userAccountInCore.id, userId),
      ],
    });
    const data = await tx
      .update(userAccountInCore)
      .set({
        lastLoginAt: new Date().toISOString(),
      })
      .where(whereClause)
      .returning();
    return data[0];
  }
);

const updateUserAccountPasswordByIdRepository = catchAsyncRepository(
  async (tx: TransactionClient, userId: string, password: string) => {
    const whereClause = buildWhereClause({
      table: userAccountInCore,
      andClause: [
        eq(userAccountInCore.isActive, true),
        eq(userAccountInCore.id, userId),
      ],
    });

    const data = await tx
      .update(userAccountInCore)
      .set({
        password: password,
      })
      .where(whereClause)
      .returning();

    return data[0];
  }
);

export const UserAccountRepository = {
  create: createUserAccountRepository,
  updateLastLogin: updateUserAccountLastLoginByIdRepository,
  updatePassword: updateUserAccountPasswordByIdRepository,
};
