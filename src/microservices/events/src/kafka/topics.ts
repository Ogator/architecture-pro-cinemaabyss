export const TOPICS = {
  movie: 'movie-events',
  user: 'user-events',
  payment: 'payment-events',
} as const;

export type EventType = keyof typeof TOPICS;

export const ALL_TOPICS: string[] = Object.values(TOPICS);

/** Событие в том виде, в котором оно уходит в Kafka и возвращается клиенту. */
export interface DomainEvent<T = object> {
  id: string;
  type: EventType;
  timestamp: string;
  payload: T;
}
