import { Profile } from './profile.interface';

export class ReviewDto {
    id: number;
    content: string;
    createdAt: string;
    profile: Profile;
}
