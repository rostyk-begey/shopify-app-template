import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from '../auth/auth.module';
import { ProductModule } from '../product/product.module';
import { load } from '../../environments/environment';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StaticsController } from './statics.controller';
import { SetupFrameHeadersMiddleware } from './setup-frame-headers.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [load],
      isGlobal: true,
    }),
    AuthModule,
    ProductModule,
  ],
  controllers: [AppController, StaticsController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SetupFrameHeadersMiddleware).forRoutes(StaticsController);
  }
}
