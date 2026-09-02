import { Message } from '@/shared/messages';
import { z } from 'zod';

export const signUpSchema = z.object({
  username: z
    .string({
      error: Message.AUTH.USERNAME_REQUIRED,
    })
    .nonempty({
      error: Message.AUTH.USERNAME_REQUIRED,
    }),
  email: z
    .email({
      error: Message.AUTH.EMAIL_REQUIRED,
    })
    .nonempty({ error: Message.AUTH.EMAIL_REQUIRED }),
  password: z
    .string({ error: Message.AUTH.PASSWORD_REQUIRED })
    .nonempty({ error: Message.AUTH.PASSWORD_REQUIRED }),
  displayName: z.string({ error: Message.USER.NAME_REQUIRED }).nullable(),
});
export type SignUpDto = z.infer<typeof signUpSchema>;
