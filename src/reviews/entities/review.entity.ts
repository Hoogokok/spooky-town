import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('reviews')
export class Review {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @Column({ name: 'review_movie_id' })
    movieId: number;

    @Column({ name: 'review_user_id', type: 'uuid' })
    userId: string;

    @Column({ name: 'review_content', type: 'text' })
    content: string;

    @Column({ name: 'review_user_name', type: 'text' })
    userName: string;

    @Column({ type: 'integer' })
    rating: number;
} 