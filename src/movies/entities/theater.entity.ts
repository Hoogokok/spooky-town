import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { MovieTheater } from './movie-theater.entity';

@Entity('theaters')
export class Theater {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'text' })
  name: string;

  @OneToMany(() => MovieTheater, movieTheater => movieTheater.theater)
  movieTheaters: MovieTheater[];
}