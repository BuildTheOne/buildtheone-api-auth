import { Message } from '@/shared/messages';
import z from 'zod';

export const resetPasswordRequestSchema = z.object({
  payload: z
    .string({
      error: Message.AUTH.EMAIL_REQUIRED,
    })
    .nonempty({
      error: Message.AUTH.EMAIL_REQUIRED,
    }),
});
export type ResetPasswordRequestDto = z.infer<
  typeof resetPasswordRequestSchema
>;

export const resetPasswordSchema = z.object({
  newPassword: z
    .string({
      error: Message.AUTH.NEW_PASSWORD_REQUIRED,
    })
    .nonempty({
      error: Message.AUTH.NEW_PASSWORD_REQUIRED,
    }),
});
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
