import { ProxyConfigService } from '../config/proxy-config.service';
import { RoutingService } from './routing.service';

function makeRouting(overrides: Partial<ProxyConfigService>): RoutingService {
  const config = {
    monolithUrl: 'http://monolith:8080',
    moviesServiceUrl: 'http://movies-service:8081',
    eventsServiceUrl: 'http://events-service:8082',
    gradualMigration: true,
    moviesMigrationPercent: 0,
    ...overrides,
  } as ProxyConfigService;
  return new RoutingService(config);
}

describe('RoutingService', () => {
  it('отправляет события в events-service', () => {
    expect(makeRouting({}).resolve('/api/events/movie')).toBe('events');
  });

  it('отправляет остальные домены в монолит', () => {
    const routing = makeRouting({});
    expect(routing.resolve('/api/users')).toBe('monolith');
    expect(routing.resolve('/api/payments')).toBe('monolith');
    expect(routing.resolve('/api/subscriptions')).toBe('monolith');
  });

  it('health-чек movies всегда идёт в movies-service', () => {
    expect(makeRouting({ moviesMigrationPercent: 0 }).resolve('/api/movies/health')).toBe('movies');
  });

  it('при 0% весь трафик movies остаётся в монолите', () => {
    const routing = makeRouting({ moviesMigrationPercent: 0 });
    for (let i = 0; i < 100; i++) {
      expect(routing.resolve('/api/movies')).toBe('monolith');
    }
  });

  it('при 100% весь трафик movies уходит в микросервис', () => {
    const routing = makeRouting({ moviesMigrationPercent: 100 });
    for (let i = 0; i < 100; i++) {
      expect(routing.resolve('/api/movies')).toBe('movies');
    }
  });

  it('при 50% трафик делится между монолитом и микросервисом', () => {
    const routing = makeRouting({ moviesMigrationPercent: 50 });
    const targets = new Set<string>();
    const random = jest.spyOn(Math, 'random');
    random.mockReturnValueOnce(0.1);
    targets.add(routing.resolve('/api/movies'));
    random.mockReturnValueOnce(0.9);
    targets.add(routing.resolve('/api/movies'));
    random.mockRestore();

    expect(targets).toEqual(new Set(['movies', 'monolith']));
  });

  it('при выключенном фиче-флаге домен movies полностью переключён на микросервис', () => {
    const routing = makeRouting({ gradualMigration: false, moviesMigrationPercent: 0 });
    expect(routing.resolve('/api/movies')).toBe('movies');
  });
});
