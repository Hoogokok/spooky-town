import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Movie } from './movie.entity';
@Entity('movie_providers')
export class MovieProvider{
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'bigint', name: 'movie_id' })
  movieId: number;

  @Column({ type: 'bigint', name: 'the_provider_id' })
  theProviderId: number;

  @ManyToOne(() => Movie, movie => movie.movieProviders)
  @JoinColumn({ name: 'movie_id' })
  movie: Movie;
}
