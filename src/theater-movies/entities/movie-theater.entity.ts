import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TheaterMovie } from './theater-movie.entity';
import { Theater } from './theater.entity';

@Entity('movie_theaters')
export class MovieTheater {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: number;

  @ManyToOne(() => TheaterMovie, movie => movie.movieTheaters)
  @JoinColumn({ name: 'movie_id'})
  movie: TheaterMovie;

  @ManyToOne(() => Theater, theater => theater.movieTheaters)
  @JoinColumn({ name: 'theaters_id'})
  theater: Theater;
}
