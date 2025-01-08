import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseGuard implements CanActivate {
    private supabase;

    constructor() {
        this.supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
        );
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = request.headers.authorization?.split(' ')[1];

        if (!token) {
            throw new UnauthorizedException('No token provided');
        }

        try {
            const { data: { user }, error } = await this.supabase.auth.getUser(token);

            if (error) {
                throw new UnauthorizedException(error.message);
            }

            // 유효한 토큰이면 request에 user 정보를 붙여서 컨트롤러에서 사용할 수 있게 함
            request.user = user;
            return true;
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }
} 