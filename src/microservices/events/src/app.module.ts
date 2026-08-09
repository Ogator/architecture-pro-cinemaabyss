import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventsController } from './events/events.controller';
import { EventsService } from './events/events.service';
import { KafkaClientService } from './kafka/kafka-client.service';
import { KafkaConsumerService } from './kafka/kafka-consumer.service';
import { KafkaProducerService } from './kafka/kafka-producer.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [EventsController],
  providers: [EventsService, KafkaClientService, KafkaProducerService, KafkaConsumerService],
})
export class AppModule {}
