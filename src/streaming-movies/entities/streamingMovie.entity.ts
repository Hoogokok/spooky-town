import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity('movie')
export class StreamingMovie {
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
}