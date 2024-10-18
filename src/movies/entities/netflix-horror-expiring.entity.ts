import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('netflix_horror_expiring')
export class NetflixHorrorExpiring {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'date', name: 'expired_date' })
  expiredDate: Date;

  @Column({ type: 'bigint', name: 'the_movie_db_id' })
  theMovieDbId: number;
}