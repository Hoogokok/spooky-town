import { IsNotEmpty } from 'class-validator';

export class UploadProfileImageDto {
    @IsNotEmpty()
    image: Express.Multer.File;
} 