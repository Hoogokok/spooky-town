import { IsNotEmpty } from 'class-validator';
import { MulterFile } from '../interfaces/multer.interface';

export class UploadProfileImageDto {
    @IsNotEmpty()
    image: MulterFile;
} 