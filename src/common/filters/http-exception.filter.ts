import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;
    const message = Array.isArray(exceptionResponse.message)
      ? exceptionResponse.message[0]
      : exceptionResponse.message;

    const referer = req.headers.referer || '/';

    if (req.headers.accept?.includes('application/json')) {
      return res.status(status).json(exceptionResponse);
    }
    if (req.headers.accept?.includes('application/json')) {
      return res.status(status).json(exceptionResponse);
    }

    if (status === 401) {
      return res.redirect('/auth/login');
    }

    if (status === 403) {
      return res.redirect('/');
    }


    return res.redirect(`${referer}?error=${encodeURIComponent(message)}`);
  }
}
