import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { Movie } from './movie.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @Column({ type: 'uuid', name: 'review_user_id' })
  reviewUserId: string;

  @Column({ type: 'text', name: 'review_content' })
  reviewContent: string;

  @ManyToOne(() => Movie, movie => movie.reviews)
  movie: Movie;
}
