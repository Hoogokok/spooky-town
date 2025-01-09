import { Injectable, BadRequestException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { MulterFile } from './interfaces/multer.interface';

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

    async updateProfileImage(userId: string, file: MulterFile) {
        const fileName = `user-${userId}.jpeg`;
        const filePath = `${userId}/${fileName}`;

        try {
            const { error } = await this.supabase.storage
                .from('profile-image')
                .upload(filePath, file.buffer, {
                    contentType: file.mimetype,
                    upsert: true // 기존 파일이 있으면 덮어쓰기
                });

            if (error) {
                throw new BadRequestException(error.message);
            }

            // 업로드된 이미지의 public URL 반환
            const { data: { publicUrl } } = this.supabase.storage
                .from('profile-image')
                .getPublicUrl(filePath);

            return { imageUrl: publicUrl };
        } catch (error) {
            throw new BadRequestException('이미지 업로드에 실패했습니다.');
        }
    }
} 