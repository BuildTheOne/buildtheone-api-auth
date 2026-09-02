import { Message } from '@/shared/messages';
import { z } from 'zod';

export const changePasswordSchema = z
  .object({
    oldPassword: z
      .string({ error: Message.AUTH.OLD_PASSWORD_REQUIRED })
      .nonempty({ error: Message.AUTH.OLD_PASSWORD_REQUIRED }),
    newPassword: z
      .string({ error: Message.AUTH.NEW_PASSWORD_REQUIRED })
      .nonempty({ error: Message.AUTH.NEW_PASSWORD_REQUIRED }),
  })
  .superRefine((value, ctx) => {
    const { oldPassword, newPassword } = value;
    if (oldPassword === newPassword) {
      const message = Message.AUTH.PASSWORD_CANNOT_SAME;
      ctx.addIssue({
        message: message,
        path: ['oldPassword'],
        code: 'custom',
      });
      ctx.addIssue({
        message: message,
        path: ['newPassword'],
        code: 'custom',
      });
      return;
    }
  });
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
