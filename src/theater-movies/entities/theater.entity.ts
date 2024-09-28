import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { MovieTheater } from './movie-theater.entity';
@Entity('theater')
export class Theater {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: number;

  @Column({ name: 'name', type: 'text' })
  name: string;

  @OneToMany(() => MovieTheater, movieTheater => movieTheater.theater)
  movieTheaters: MovieTheater[];
}
