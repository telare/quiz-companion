import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export interface Response<T> {
  success: boolean;
  data: T;
}

@Injectable()
export class TransformInterceptor<
  T extends Response<T>,
> implements NestInterceptor<
  T, // what returns a controller
  Response<T> | T // in what is transformed
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>, // type of what a route handler returns
  ): Observable<Response<T> | T> {
    const host = context.getType();
    if (host !== "http") {
      return next.handle();
    }
    return next.handle().pipe(map((data) => ({ success: true, data }))); // handle() invokes the route handler
  }
}
