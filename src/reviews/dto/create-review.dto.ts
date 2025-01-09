import { IsNotEmpty, IsNumber, IsString, Min, Max, Length } from 'class-validator';

export class CreateReviewDto {
    @IsNotEmpty()
    @IsNumber()
    @Min(1, { message: '평점은 1점 이상이어야 합니다.' })
    @Max(5, { message: '평점은 5점 이하여야 합니다.' })
    rating: number;

    @IsNotEmpty()
    @IsString()
    @Length(10, 500, {
        message: '리뷰는 최소 10자 이상, 500자 이하여야 합니다.'
    })
    content: string;
} 