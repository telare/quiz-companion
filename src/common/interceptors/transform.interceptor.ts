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
export class TransformInterceptor<T> implements NestInterceptor<
  T, // what returns a controller
  Response<T> // in what is transformed
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>, // type of what a route handler returns
  ): Observable<Response<T>> {
    return next.handle().pipe(map((data) => ({ success: true, data }))); // handle() invokes the route handler
  }
}
