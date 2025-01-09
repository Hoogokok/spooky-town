import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class MaxFileSizeInterceptor implements NestInterceptor {
    constructor(private maxSize: number) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const file = request.file;

        if (file && file.size > this.maxSize) {
            throw new BadRequestException('이미지 크기는 5MB 이하여야 합니다.');
        }

        return next.handle();
    }
} 