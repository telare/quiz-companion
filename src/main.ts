/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalExceptionFilter } from './common/filters';
import {
  LoggingInterceptor,
  TransformInterceptor,
} from './common/interceptors';
import metadata from './metadata';
import { MongoExceptionFilter } from './common/filters/mongo-exeption.filter';
import { HttpExceptionFilter } from './common/filters/http-exeption.filter';

let cachedApp: any;
const isProd = process.env.NODE_ENV === 'production';

async function bootstrap() {
  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new LoggingInterceptor(),
  );

  app.useGlobalFilters(
    new GlobalExceptionFilter(),
    new MongoExceptionFilter(),
    new HttpExceptionFilter(),
  );

  app.useGlobalPipes(new ValidationPipe());
  app.enableShutdownHooks();

  const config = new DocumentBuilder()
    .setTitle('Quiz Companion API')
    .setVersion('1.0')
    .build();

  await SwaggerModule.loadPluginMetadata(metadata);
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const logger = new Logger('[bootstrap]');
  if (isProd) {
    await app.init();
  } else {
    const port = process.env.PORT || 3000;
    const TELEGRAM_WEBHOOK_PATH =
      process.env.TELEGRAM_WEBHOOK_PATH || '/webhook';

    await app.listen(port);

    logger.debug(`🟢 Server is running on http://localhost:${port}`);
    logger.debug(`📜 Docs is running on http://localhost:${port}/api/docs`);
    logger.debug(
      `💬 Telegram WebHook is running on http://localhost:${port}${TELEGRAM_WEBHOOK_PATH}`,
    );
  }
  return server;
}
if (!isProd) {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  bootstrap();
}

export default async (req: any, res: any) => {
  if (!cachedApp) {
    cachedApp = await bootstrap();
  }
  return cachedApp(req, res);
};
