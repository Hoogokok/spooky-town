import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
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
  @JoinColumn({ name: 'review_movie_id', referencedColumnName: 'theMovieDbId' })
  movie: Movie;

  @Column({ type: 'bigint', name: 'review_movie_id' })
  review_movie_id: number;
}
