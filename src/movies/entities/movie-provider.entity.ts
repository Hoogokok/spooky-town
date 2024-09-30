import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity('movie_provider')
export class MovieProvider{
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'character varying' })
  name: string;
}