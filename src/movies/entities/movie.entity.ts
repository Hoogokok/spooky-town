import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { MovieProvider } from './movie-provider.entity';
import { MovieTheater } from './movie-theater.entity';
import { Review } from './review.entity'; 

@Entity('movie')
export class Movie {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', nullable: true })
  release_date: string;

  @Column({ type: 'text', nullable: true })
  poster_path: string;

  @Column({ type: 'text', nullable: true })
  overview: string;

  @Column({ type: 'numeric', precision: 3, scale: 1, nullable: true })
  vote_average: number;

  @Column({ type: 'numeric', precision: 10, scale: 0, nullable: true })
  vote_count: number;

  @Column({ type: 'bigint', name: 'the_movie_db_id', unique: true })
  theMovieDbId: number;

  @Column({ type: 'boolean', name: 'is_theatrical_release' })
  isTheatricalRelease: boolean;

  @OneToMany(() => MovieProvider, movieProvider => movieProvider.movie)
  movieProviders: MovieProvider[];

  @OneToMany(() => MovieTheater, movieTheater => movieTheater.movie)
  movieTheaters: MovieTheater[];

  @OneToMany(() => Review, review => review.movie)
  reviews: Review[];
}