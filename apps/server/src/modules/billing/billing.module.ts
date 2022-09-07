import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BillingService } from './billing.service';
import { VerifyRequestMiddleware } from './verify-request.middleware';

@Module({
  imports: [AuthModule],
  controllers: [],
  providers: [BillingService, VerifyRequestMiddleware],
  exports: [BillingService, VerifyRequestMiddleware],
})
export class BillingModule {}
