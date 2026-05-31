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

    const message = this.extractMessage(exceptionResponse);

    if (req.headers.accept?.includes('application/json')) {
      return res.status(status).json(exceptionResponse);
    }

    if (status === 404) {
      return res.status(404).send('Not Found');
    }

    if (status === 401) {
      return res.redirect(`/auth/login?error=${encodeURIComponent(message)}`);
    }

    if (status === 403) {
      return res.redirect('/');
    }

    const referer = req.headers.referer || '/auth/login';

    const baseReferer = referer.split('?')[0];
    return res.redirect(`${baseReferer}?error=${encodeURIComponent(message)}`);
  }

  private extractMessage(exceptionResponse: any): string {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    const { message } = exceptionResponse;

    if (Array.isArray(message)) {

      return message.join(', ');
    }

    if (typeof message === 'string') {
      return message;
    }

    return 'An unexpected error occurred';
  }
}
