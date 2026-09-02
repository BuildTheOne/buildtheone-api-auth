import z from 'zod';

export const createUserVerificationSchema = z.object({
  userId: z.string().nonempty(),
  token: z.string().nonempty(),
  type: z.enum(['OTP', 'VERIFICATION', 'RESET_PASSWORD']),
});
export type CreateUserVerification = z.infer<
  typeof createUserVerificationSchema
>;
