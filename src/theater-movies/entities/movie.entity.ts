import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { MovieTheater } from './movie-theater.entity';
@Entity('upcoming_movie')
export class Movie {
  @PrimaryGeneratedColumn({ name: 'pk', type: 'bigint' })
  pk: number;

  @Column({ type: 'text' })
  title: string;

  @Column({ name: 'release_date', type: 'character varying' })
  releaseDate: string;

  @Column({ name: 'poster_path', type: 'character varying' })
  posterPath: string;

  @Column({ type: 'text' })
  overview: string;

  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: number;

  @Column({ name: 'vote_average', type: 'numeric', precision: 10, scale: 2 })
  voteAverage: number;

  @Column({ name: 'vote_count', type: 'numeric', precision: 10, scale: 0 })
  voteCount: number;

  @Column({ name: 'the_movie_db_id', type: 'bigint' })
  theMovieDbId: number;

  @OneToMany(() => MovieTheater, movieTheater => movieTheater.movie)
  movieTheaters: MovieTheater[];
}
