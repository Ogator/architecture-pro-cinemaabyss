import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, logLevel } from 'kafkajs';

@Injectable()
export class KafkaClientService {
  private readonly logger = new Logger(KafkaClientService.name);
  readonly kafka: Kafka;
  readonly consumerGroupId: string;

  constructor(config: ConfigService) {
    const brokers = config
      .get<string>('KAFKA_BROKERS', 'kafka:9092')
      .split(',')
      .map((broker) => broker.trim())
      .filter(Boolean);

    this.consumerGroupId = config.get<string>('KAFKA_GROUP_ID', 'events-service-group');

    this.logger.log(`Брокеры Kafka: ${brokers.join(', ')}, consumer group: ${this.consumerGroupId}`);

    this.kafka = new Kafka({
      clientId: config.get<string>('KAFKA_CLIENT_ID', 'events-service'),
      brokers,
      logLevel: logLevel.WARN,
      retry: { retries: 10, initialRetryTime: 1000 },
    });
  }
}
