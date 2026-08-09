import { KafkaProducerService } from '../kafka/kafka-producer.service';
import { DomainEvent } from '../kafka/topics';
import { EventsService } from './events.service';

describe('EventsService', () => {
  let published: DomainEvent[];
  let service: EventsService;

  beforeEach(() => {
    published = [];
    const producer = {
      publish: jest.fn(async (event: DomainEvent) => {
        published.push(event);
        return { partition: 0, offset: published.length - 1 };
      }),
    } as unknown as KafkaProducerService;
    service = new EventsService(producer);
  });

  it('формирует событие фильма с id вида movie-<id>-<action>', async () => {
    const response = await service.publishMovieEvent({
      movie_id: 1,
      title: 'Inception',
      action: 'viewed',
    });

    expect(response.status).toBe('success');
    expect(response.partition).toBe(0);
    expect(response.offset).toBe(0);
    expect(response.event.id).toBe('movie-1-viewed');
    expect(response.event.type).toBe('movie');
    expect(published).toHaveLength(1);
  });

  it('формирует событие пользователя', async () => {
    const response = await service.publishUserEvent({
      user_id: 7,
      action: 'registered',
      timestamp: '2026-01-01T00:00:00Z',
    });

    expect(response.event.id).toBe('user-7-registered');
    expect(response.event.type).toBe('user');
  });

  it('формирует событие платежа', async () => {
    const response = await service.publishPaymentEvent({
      payment_id: 42,
      user_id: 7,
      amount: 9.99,
      status: 'completed',
      timestamp: '2026-01-01T00:00:00Z',
    });

    expect(response.event.id).toBe('payment-42-completed');
    expect(response.event.type).toBe('payment');
    expect(response.event.payload).toMatchObject({ amount: 9.99 });
  });

  it('проставляет timestamp события в формате ISO', async () => {
    const response = await service.publishMovieEvent({
      movie_id: 2,
      title: 'Interstellar',
      action: 'rated',
    });

    expect(new Date(response.event.timestamp).toISOString()).toBe(response.event.timestamp);
  });
});
