import z from 'zod';

const createUserSessionSchema = z.object({
  id: z.string().optional(),
  userId: z.string().nonempty(),
  expiredAt: z.iso.datetime().nonempty(),
});

export type CreateUserSessionDto = z.infer<typeof createUserSessionSchema>;
