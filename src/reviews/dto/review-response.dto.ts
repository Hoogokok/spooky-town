export class ReviewResponseDto {
    id: number;
    movieId: number;
    userId: string;
    userName: string;
    rating: number;
    content: string;
    createdAt: Date;
    updatedAt?: Date;

    constructor(partial: Partial<ReviewResponseDto>) {
        Object.assign(this, partial);
    }
} 