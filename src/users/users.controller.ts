import { Controller, Get, Patch, UseGuards, Req, Body } from '@nestjs/common';
import { SupabaseGuard } from '../auth/supabase.guard';
import { UsersService } from './users.service';

// DTO를 별도 파일로 분리
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('profile')
    @UseGuards(SupabaseGuard)
    async getProfile(@Req() req) {
        return req.user;
    }

    @Patch('profile')
    @UseGuards(SupabaseGuard)
    async updateProfile(@Req() req, @Body() updateUserDto: UpdateUserDto) {
        const updatedData = await this.usersService.updateUserProfile(
            req.user.id,
            updateUserDto.name
        );

        return {
            ...req.user,
            ...updatedData
        };
    }
} 