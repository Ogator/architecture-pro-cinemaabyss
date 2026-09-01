import { Injectable } from '@nestjs/common';
import { ProxyConfigService, RouteTarget } from '../config/proxy-config.service';

@Injectable()
export class RoutingService {
  constructor(private readonly config: ProxyConfigService) {}

  /**
   * Определяет получателя запроса по пути.
   *
   * Домен movies участвует в постепенной миграции:
   *  - GRADUAL_MIGRATION=true  — MOVIES_MIGRATION_PERCENT процентов трафика уходит в movies-service,
   *                              остальное продолжает обслуживать монолит;
   *  - GRADUAL_MIGRATION=false — весь трафик домена уходит в movies-service (миграция завершена).
   *
   * Остальные домены (users, payments, subscriptions) обслуживает монолит,
   * /api/events целиком принадлежит events-service.
   */
  resolve(path: string): RouteTarget {
    if (path.startsWith('/api/events')) {
      return 'events';
    }

    // health-чек нового сервиса в монолите не реализован, поэтому не участвует в сплите
    if (path === '/api/movies/health') {
      return 'movies';
    }

    if (path.startsWith('/api/movies')) {
      return this.resolveMoviesTarget();
    }

    return 'monolith';
  }

  private resolveMoviesTarget(): RouteTarget {
    if (!this.config.gradualMigration) {
      return 'movies';
    }
    return Math.random() * 100 < this.config.moviesMigrationPercent ? 'movies' : 'monolith';
  }
}
