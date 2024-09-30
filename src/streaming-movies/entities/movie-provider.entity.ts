import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { StreamingMovie } from './streaming-movie.entity';

@Entity('movie_providers')
export class MovieProvider {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'bigint', name: 'movie_id' })
  movieId: number;

  @Column({ type: 'bigint', name: 'the_provider_id' })
  theProviderId: number;

  @ManyToOne(() => StreamingMovie, movie => movie.movieProviders)
  @JoinColumn({ name: 'movie_id' })
  movie: StreamingMovie;
}