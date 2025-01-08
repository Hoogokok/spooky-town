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

            // 프로필 이미지 URL 생성
            const fileName = `user-${user.id}.jpeg`;
            const filePath = `${user.id}/${fileName}`;
            const { data: { publicUrl } } = this.supabase.storage
                .from('profile-image')
                .getPublicUrl(filePath);

            // user 객체에 이미지 URL 추가
            request.user = {
                id: user.id,
                email: user.email,
                name: user.user_metadata.name,
                imageUrl: publicUrl
            };

            return true;
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }
} 