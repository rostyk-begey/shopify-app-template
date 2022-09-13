import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthModule } from '../auth/auth.module';
import { ProductModule } from '../product/product.module';
import { load } from '../../environments/environment';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StaticsController } from './statics.controller';
import { SetupFrameHeadersMiddleware } from './setup-frame-headers.middleware';
import { ServeStaticModule } from '@nestjs/serve-static';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [load],
      isGlobal: true,
    }),
    ServeStaticModule.forRootAsync({
      useFactory: (configService: ConfigService) => [
        {
          rootPath: configService.get('staticsPath'),
          serveStaticOptions: {
            index: false,
          },
        },
      ],
      inject: [ConfigService],
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
