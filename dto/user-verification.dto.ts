import { userVerificationInCore } from '@/shared/db/schema';
import { createInsertSchema } from 'drizzle-zod';
import z from 'zod';

export const createUserVerificationSchema = createInsertSchema(
  userVerificationInCore
).pick({
  userId: true,
  token: true,
  type: true,
});
export type CreateUserVerification = z.infer<
  typeof createUserVerificationSchema
>;
