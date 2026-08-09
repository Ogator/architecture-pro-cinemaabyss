import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Producer } from 'kafkajs';
import { KafkaClientService } from './kafka-client.service';
import { DomainEvent, TOPICS } from './topics';

export interface PublishResult {
  partition: number;
  offset: number;
}

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
  private readonly producer: Producer;
  private connected = false;

  constructor(private readonly client: KafkaClientService) {
    this.producer = this.client.kafka.producer({ allowAutoTopicCreation: true });
  }

  async onModuleInit(): Promise<void> {
    // не роняем сервис, если брокер ещё не поднялся — подключимся при первой отправке
    try {
      await this.connect();
    } catch (error) {
      this.logger.warn(`Producer не подключился на старте: ${(error as Error).message}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.connected) {
      await this.producer.disconnect();
    }
  }

  async publish(event: DomainEvent): Promise<PublishResult> {
    await this.connect();

    const topic = TOPICS[event.type];
    const [metadata] = await this.producer.send({
      topic,
      messages: [{ key: event.id, value: JSON.stringify(event) }],
    });

    const partition = metadata.partition;
    const offset = Number(metadata.baseOffset ?? 0);
    this.logger.log(`Отправлено в ${topic}: id=${event.id} partition=${partition} offset=${offset}`);

    return { partition, offset };
  }

  private async connect(): Promise<void> {
    if (this.connected) {
      return;
    }
    await this.producer.connect();
    this.connected = true;
    this.logger.log('Producer подключён к Kafka');
  }
}
