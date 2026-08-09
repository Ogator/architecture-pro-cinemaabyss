import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  // bodyParser отключён: тело запроса должно уходить в upstream нетронутым потоком
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const port = Number(process.env.PORT ?? 8000);
  await app.listen(port, '0.0.0.0');
  new Logger('Bootstrap').log(`Proxy service (API Gateway) слушает порт ${port}`);
}

void bootstrap();
