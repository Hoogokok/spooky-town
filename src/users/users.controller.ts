import { Controller, Get, Patch, UseGuards, Req, Body, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { SupabaseGuard } from '../auth/supabase.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { MaxFileSizeInterceptor } from '../common/interceptors/max-file-size.interceptor';

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

    @Post('profile/image')
    @UseGuards(SupabaseGuard)
    @UseInterceptors(
        FileInterceptor('image'),
        new MaxFileSizeInterceptor(5 * 1024 * 1024) // 5MB 제한
    )
    async uploadProfileImage(
        @Req() req,
        @UploadedFile() file: any
    ) {
        if (!file) {
            throw new BadRequestException('이미지 파일이 필요합니다.');
        }

        if (!file.mimetype.match(/^image\/(jpg|jpeg)$/)) {
            throw new BadRequestException('JPG 또는 JPEG 형식의 이미지만 업로드 가능합니다.');
        }

        return this.usersService.updateProfileImage(req.user.id, file);
    }
} 