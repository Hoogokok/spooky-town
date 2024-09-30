import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { MovieProvider } from './movie-provider.entity';
import { MovieTheater } from './movie-theater.entity';

@Entity('movie')
export class Movie {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'character varying' })
  release_date: string;

  @Column({ type: 'character varying' })
  poster_path: string;

  @Column({ type: 'text' })
  overview: string;

  @Column({ type: 'numeric', precision: 3, scale: 1 })
  vote_average: number;

  @Column({ type: 'numeric', precision: 10, scale: 0 })
  vote_count: number;

  @Column({ type: 'bigint', name: 'the_movie_db_id' })
  theMovieDbId: number;

  @Column({ type: 'boolean', name: 'is_theatrical_release' })
  isTheatricalRelease: boolean;

  @OneToMany(() => MovieProvider, movieProvider => movieProvider.movies)
  movieProviders: MovieProvider[];

  @OneToMany(() => MovieTheater, movieTheater => movieTheater.movie)
  movieTheaters: MovieTheater[];
}