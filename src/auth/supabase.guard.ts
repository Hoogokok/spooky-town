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

            // 토큰 검증 후 기본 user 정보만 저장
            request.user = {
                id: user.id,
                email: user.email,
                metadata: user.user_metadata
            };

            return true;
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }
} 