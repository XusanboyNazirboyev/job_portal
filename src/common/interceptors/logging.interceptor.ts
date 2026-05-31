import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const { method, url } = req;
    const now = Date.now();

    console.log(` ${method} ${url}✅`);

    return next.handle().pipe(
      tap(() => {
        console.log(`${method} ${url}✅ — ${Date.now() - now}ms`);
      }),
      catchError((err) => {
        console.log(
          ` ${method} ${url}❎ — ${Date.now() - now}ms — ${err?.status}`,
        );
        return throwError(() => new HttpException(err?.response, err?.status));
      }),
    );
  }
}
