import { Injectable } from '@nestjs/common';
import { KafkaProducerService } from '../kafka/kafka-producer.service';
import { DomainEvent, EventType } from '../kafka/topics';
import { MovieEventDto } from './dto/movie-event.dto';
import { PaymentEventDto } from './dto/payment-event.dto';
import { UserEventDto } from './dto/user-event.dto';

export interface EventResponse {
  status: 'success';
  partition: number;
  offset: number;
  event: DomainEvent;
}

@Injectable()
export class EventsService {
  constructor(private readonly producer: KafkaProducerService) {}

  publishMovieEvent(dto: MovieEventDto): Promise<EventResponse> {
    return this.publish('movie', `movie-${dto.movie_id}-${dto.action}`, dto);
  }

  publishUserEvent(dto: UserEventDto): Promise<EventResponse> {
    return this.publish('user', `user-${dto.user_id}-${dto.action}`, dto);
  }

  publishPaymentEvent(dto: PaymentEventDto): Promise<EventResponse> {
    return this.publish('payment', `payment-${dto.payment_id}-${dto.status}`, dto);
  }

  private async publish(
    type: EventType,
    id: string,
    payload: object,
  ): Promise<EventResponse> {
    const event: DomainEvent = {
      id,
      type,
      timestamp: new Date().toISOString(),
      payload,
    };

    const { partition, offset } = await this.producer.publish(event);

    return { status: 'success', partition, offset, event };
  }
}
