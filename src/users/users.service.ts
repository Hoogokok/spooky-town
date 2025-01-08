import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class UsersService {
    private supabase;

    constructor() {
        this.supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
        );
    }

    async getUserProfile(userId: string) {
        // 프로필 이미지 URL 생성
        const fileName = `user-${userId}.jpeg`;
        const filePath = `${userId}/${fileName}`;
        const { data: { publicUrl } } = this.supabase.storage
            .from('profile-image')
            .getPublicUrl(filePath);

        return {
            imageUrl: publicUrl
        };
    }

    async updateUserProfile(userId: string, name: string) {
        const { error } = await this.supabase.auth.admin.updateUserById(
            userId,
            { user_metadata: { name } }
        );

        if (error) {
            throw new Error(error.message);
        }

        return { name };
    }
} 