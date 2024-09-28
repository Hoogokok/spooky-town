import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity('theater')
export class Theater {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: number;

  @Column({ name: 'name', type: 'text' })
  name: string;
}
