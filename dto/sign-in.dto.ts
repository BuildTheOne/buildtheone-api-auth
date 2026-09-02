import { Message } from '@/shared/messages';
import { z } from 'zod';

export const signInSchema = z.object({
  username: z
    .string({
      error:Message.AUTH.EMAIL_OR_USERNAME_REQUIRED,
    })
    .nonempty({
      error:Message.AUTH.EMAIL_OR_USERNAME_REQUIRED,
    }),
  password: z
    .string({ error:Message.AUTH.PASSWORD_REQUIRED })
    .nonempty({ error:Message.AUTH.PASSWORD_REQUIRED }),
});
export type SignInDto = z.infer<typeof signInSchema>;
