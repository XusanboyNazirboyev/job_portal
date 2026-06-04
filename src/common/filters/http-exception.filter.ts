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

  // Around line 45-50 in your filter
  private extractMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        return exceptionResponse;
      }

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const { message } = exceptionResponse as {
          message?: string | string[];
        };
        if (Array.isArray(message)) return message.join(', ');
        return message ?? exception.message;
      }
    }

    if (exception instanceof Error) {
      return exception.message;
    }

    return 'Internal server error';
  }
}
