import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { VerifyRequestMiddleware } from '../billing/verify-request.middleware';
import { BillingModule } from '../billing/billing.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, BillingModule],
  controllers: [ProductController],
  providers: [ProductService, VerifyRequestMiddleware],
})
export class ProductModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(VerifyRequestMiddleware).forRoutes(ProductController);
  }
}
