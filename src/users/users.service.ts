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