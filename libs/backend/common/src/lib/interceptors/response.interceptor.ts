import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
    success: boolean;
    statusCode: number;
    message: string;
    data: T;
    timestamp: string;
    path: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
        const request = context.switchToHttp().getRequest();
        const statusCode = context.switchToHttp().getResponse().statusCode;

        return next.handle().pipe(
            map(data => ({
                success: true,
                statusCode,
                message: data?.message || 'Request successful',
                data: data?.data || data,
                timestamp: new Date().toISOString(),
                path: request.url,
            })),
        );
    }
  }