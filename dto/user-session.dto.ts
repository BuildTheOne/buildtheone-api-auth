import { userSessionInCore } from '@/shared/db/schema';
import { createInsertSchema } from 'drizzle-zod';
import z from 'zod';

export const createUserSessionSchema = createInsertSchema(
  userSessionInCore
).pick({
  id: true,
  userId: true,
  expiredAt: true,
});
export type CreateUserSessionDto = z.infer<typeof createUserSessionSchema>;
