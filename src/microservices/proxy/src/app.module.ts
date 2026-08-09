import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProxyConfigService } from './config/proxy-config.service';
import { HealthController } from './health/health.controller';
import { ProxyMiddleware } from './proxy/proxy.middleware';
import { RoutingService } from './proxy/routing.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [HealthController],
  providers: [ProxyConfigService, RoutingService, ProxyMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(ProxyMiddleware).forRoutes({ path: 'api/*path', method: RequestMethod.ALL });
  }
}
