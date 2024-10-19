import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { NetflixHorrorExpiring } from '../entities/netflix-horror-expiring.entity';

@Injectable()
export class NetflixHorrorExpiringRepository {
 
  constructor(
    @InjectRepository(NetflixHorrorExpiring)
    private readonly repository: Repository<NetflixHorrorExpiring>,
  ) {}

  async findExpiringMovies(date: Date): Promise<NetflixHorrorExpiring[]> {
    return this.repository.find({
      where: {
        expiredDate: MoreThanOrEqual(date)
      },
      order: {
        expiredDate: 'ASC'
      }
    });
  }

  async findByTheMovieDbId(theMovieDbId: number): Promise<NetflixHorrorExpiring | undefined> {
    return this.repository.findOne({
      where: { theMovieDbId }
    });
  }

  async clear() {
    await this.repository.clear();
  }
}
