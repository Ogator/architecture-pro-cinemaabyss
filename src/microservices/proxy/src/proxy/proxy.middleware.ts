import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { createProxyMiddleware, RequestHandler } from 'http-proxy-middleware';
import { ProxyConfigService } from '../config/proxy-config.service';
import { RoutingService } from './routing.service';

@Injectable()
export class ProxyMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ProxyMiddleware.name);
  private readonly proxy: RequestHandler<Request, Response>;

  constructor(
    private readonly routing: RoutingService,
    private readonly config: ProxyConfigService,
  ) {
    this.proxy = createProxyMiddleware<Request, Response>({
      // target обязателен как значение по умолчанию, реальный получатель выбирается в router
      target: this.config.monolithUrl,
      changeOrigin: true,
      xfwd: true,
      router: (req) => {
        const target = this.routing.resolve(req.path);
        const url = this.config.targetUrl(target);
        this.logger.log(`${req.method} ${req.originalUrl} -> ${target} (${url})`);
        return url;
      },
      on: {
        error: (err, _req, res) => {
          this.logger.error(`Ошибка проксирования: ${err.message}`);
          const response = res as Response;
          if (typeof response.status !== 'function' || response.headersSent) {
            return;
          }
          response.status(502).json({
            status: false,
            error: 'Bad Gateway',
            message: err.message,
          });
        },
      },
    });
  }

  use(req: Request, res: Response, next: NextFunction): void {
    this.proxy(req, res, next);
  }
}
