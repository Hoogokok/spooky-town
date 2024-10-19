import { NetflixHorrorExpiring } from '../../entities/netflix-horror-expiring.entity';

export function createTestNetflixHorrorExpiring(overrides: Partial<NetflixHorrorExpiring> = {}): NetflixHorrorExpiring {
  return {
    id: 1,
    theMovieDbId: 12345,
    title: '만료 예정 공포 영화',
    ...overrides
  } as NetflixHorrorExpiring;
}
