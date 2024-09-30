import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Movie } from './movie.entity';
@Entity('movie_provider')
export class MovieProvider{
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'character varying' })
  name: string;

  @OneToMany(() => Movie, movie => movie.movieProviders)
  movies: Movie[];
}
