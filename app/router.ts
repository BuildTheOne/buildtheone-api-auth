import { HttpStatus } from '@/shared/constants/http-status';
import { catchAsyncController } from '@/shared/lib/error';
import { filesRouter } from '@/shared/lib/files';
import { Message } from '@/shared/messages';
import { Module } from '@/shared/modules';
import { ResponseHandler } from '@/shared/response';
import { Request, Response, Router } from 'express';

const apiInfoController = catchAsyncController(
  async (req: Request, res: Response) => {
    ResponseHandler({
      req,
      res,
      statusCode: HttpStatus.OK,
      message: Message.SUCCESS,
      data: {
        title: Module.auth.name,
        version: 1,
        description: Module.auth.desc,
        author: 'https://github.com/BuildTheOne',
      },
    });
  }
);

const authRouter = Router();

authRouter.get('', apiInfoController);

export { authRouter };
