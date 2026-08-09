import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Consumer } from 'kafkajs';
import { KafkaClientService } from './kafka-client.service';
import { ALL_TOPICS, DomainEvent } from './topics';

/**
 * Consumer читает те же топики, в которые пишет сам сервис (MVP-проверка гипотезы):
 * события обрабатываются внутри сервиса с записью в лог.
 */
@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private readonly consumer: Consumer;
  private running = false;

  constructor(private readonly client: KafkaClientService) {
    this.consumer = this.client.kafka.consumer({ groupId: this.client.consumerGroupId });
  }

  async onModuleInit(): Promise<void> {
    // подписка идёт в фоне: недоступность брокера не должна блокировать старт HTTP-сервера
    void this.start();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.running) {
      await this.consumer.disconnect();
    }
  }

  private async start(): Promise<void> {
    try {
      await this.consumer.connect();
      await this.consumer.subscribe({ topics: ALL_TOPICS, fromBeginning: false });
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          this.handle(topic, partition, message.offset, message.value?.toString());
        },
      });
      this.running = true;
      this.logger.log(`Consumer подписан на топики: ${ALL_TOPICS.join(', ')}`);
    } catch (error) {
      this.logger.error(`Не удалось запустить consumer: ${(error as Error).message}`);
    }
  }

  private handle(topic: string, partition: number, offset: string, raw?: string): void {
    if (!raw) {
      this.logger.warn(`Пустое сообщение в ${topic}[${partition}]@${offset}`);
      return;
    }

    try {
      const event = JSON.parse(raw) as DomainEvent;
      this.logger.log(
        `Обработано событие ${event.type} id=${event.id} из ${topic}[${partition}]@${offset}: ` +
          JSON.stringify(event.payload),
      );
    } catch {
      this.logger.warn(`Не удалось разобрать сообщение из ${topic}[${partition}]@${offset}: ${raw}`);
    }
  }
}
