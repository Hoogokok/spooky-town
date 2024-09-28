import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Movie } from './movie.entity';
import { Theater } from './theater.entity';

@Entity('movie_theater')
export class MovieTheater {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: number;

  @ManyToOne(() => Movie, movie => movie.movieTheaters)
  @JoinColumn({ name: 'movie_id'})
  movie: Movie;

  @ManyToOne(() => Theater, theater => theater.movieTheaters)
  @JoinColumn({ name: 'theater_id'})
  theater: Theater;
}
