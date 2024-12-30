import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Movie } from './movie.entity';
import { TimestampColumnType } from '../../common/database/column-types/timestamp';
@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @CreateDateColumn({ type: 'text', transformer: new TimestampColumnType() })
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

  @Column({ type: 'text', name: 'review_user_name' })
  reviewUserName: string;
}
