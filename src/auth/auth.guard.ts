import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException('API 키가 없습니다.');
    }

    if (apiKey !== process.env.API_KEY) {
      throw new UnauthorizedException('유효하지 않은 API 키입니다.');
    }

    return true;
  }
}