import { authRouter } from '@/app/router';
import { connectEmail } from '@/shared/lib/email';
import { errorHandler, NotFoundError } from '@/shared/lib/error';
import { loggerMiddleware } from '@/shared/lib/logger';
import { connectRedis } from '@/shared/lib/redis';
import { connectStorage } from '@/shared/lib/storage';
import express from 'express';
import 'tsconfig-paths/register';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);

connectRedis();
connectStorage();
connectEmail();

app.use('', authRouter);

app.use((_, __, next) => {
  next(new NotFoundError());
});

app.use(errorHandler);

export { app };
