import { Controller, Get, Patch, UseGuards, Req, Body } from '@nestjs/common';
import { SupabaseGuard } from '../auth/supabase.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('profile')
    @UseGuards(SupabaseGuard)
    async getProfile(@Req() req) {
        const profileData = await this.usersService.getUserProfile(req.user.id);

        return {
            id: req.user.id,
            email: req.user.email,
            name: req.user.metadata.name,
            ...profileData
        };
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