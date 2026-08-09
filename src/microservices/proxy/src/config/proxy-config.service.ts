import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type RouteTarget = 'monolith' | 'movies' | 'events';

@Injectable()
export class ProxyConfigService {
  private readonly logger = new Logger(ProxyConfigService.name);

  readonly monolithUrl: string;
  readonly moviesServiceUrl: string;
  readonly eventsServiceUrl: string;
  readonly gradualMigration: boolean;
  readonly moviesMigrationPercent: number;

  constructor(config: ConfigService) {
    this.monolithUrl = config.get<string>('MONOLITH_URL', 'http://monolith:8080');
    this.moviesServiceUrl = config.get<string>('MOVIES_SERVICE_URL', 'http://movies-service:8081');
    this.eventsServiceUrl = config.get<string>('EVENTS_SERVICE_URL', 'http://events-service:8082');
    this.gradualMigration = config.get<string>('GRADUAL_MIGRATION', 'true').toLowerCase() === 'true';
    this.moviesMigrationPercent = this.parsePercent(config.get<string>('MOVIES_MIGRATION_PERCENT', '0'));

    this.logger.log(
      `monolith=${this.monolithUrl} movies=${this.moviesServiceUrl} events=${this.eventsServiceUrl} ` +
        `gradualMigration=${this.gradualMigration} moviesMigrationPercent=${this.moviesMigrationPercent}`,
    );
  }

  targetUrl(target: RouteTarget): string {
    switch (target) {
      case 'movies':
        return this.moviesServiceUrl;
      case 'events':
        return this.eventsServiceUrl;
      case 'monolith':
        return this.monolithUrl;
    }
  }

  /** Значения вне диапазона 0..100 приводятся к границам, нечисловые — к 0. */
  private parsePercent(raw: string): number {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isNaN(parsed)) {
      this.logger.warn(`MOVIES_MIGRATION_PERCENT="${raw}" не является числом, используется 0`);
      return 0;
    }
    return Math.min(100, Math.max(0, parsed));
  }
}
