import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Request } from 'express';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    console.log('Before...');

    const className = context.getClass().name;
    const methodName = context.getHandler().name;
    const reqBody = context.switchToHttp().getRequest<Request>()
      .body as unknown;
    console.log(`[${className}] Calling ${methodName}...`);
    console.log(`Request Body: ${JSON.stringify(reqBody, null, '\t')}`);

    const now = Date.now();
    return next
      .handle()
      .pipe(tap(() => console.log(`After... ${Date.now() - now}ms`)));
  }
}
