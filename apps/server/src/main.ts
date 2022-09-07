import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Shopify } from '@shopify/shopify-api';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';

import { AppModule } from './modules/app/app.module';
import { AppService } from './modules/app/app.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.get(AppService).init();

  const port = app.get(ConfigService).get('port', { infer: true });

  app.use(cookieParser(Shopify.Context.API_SECRET_KEY));

  await app.listen(port);

  Logger.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();
