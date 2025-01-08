import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { SupabaseGuard } from '../auth/supabase.guard';

@Controller('users')
export class UsersController {
    @Get('profile')
    @UseGuards(SupabaseGuard)
    async getProfile(@Req() req) {
        // guard에서 검증된 user 정보를 사용
        const user = req.user;
        console.log(user);
        return {
            id: user.id,
            email: user.email,
            name: user.user_metadata.name,
        };
    }
} 