import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('netflix_horror_expiring')
export class NetflixHorrorExpiring {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'character varying' })
  title: string;

  @Column({ type: 'date', name: 'expired_date' })
  expiredDate: Date;

  @Column({ type: 'bigint', name: 'the_movie_db_id' })
  theMovieDbId: number;
}