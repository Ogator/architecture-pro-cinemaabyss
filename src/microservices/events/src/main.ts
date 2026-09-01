import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: false }),
  );
  app.enableShutdownHooks();

  const port = Number(process.env.PORT ?? 8082);
  await app.listen(port, '0.0.0.0');
  new Logger('Bootstrap').log(`Events service слушает порт ${port}`);
}

void bootstrap();
