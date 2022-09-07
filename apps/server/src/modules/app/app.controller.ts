import {
  Controller,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { API_ROUTES } from '@google-shopify-crs/shared';
import { Shopify } from '@shopify/shopify-api';

import { AppService } from './app.service';

@Controller()
export class AppController {
  private readonly path = API_ROUTES.WEBHOOKS.INDEX;

  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {
    this.setupWebhooks();
  }

  @Post(API_ROUTES.WEBHOOKS.INDEX)
  async webhooks(@Req() req, @Res() res) {
    try {
      await Shopify.Webhooks.Registry.process(req, res);
      this.logger.log(`Webhook processed, returned status code 200`);
    } catch (e) {
      this.logger.log(`Failed to process webhook: ${e.message}`);
      if (!res.headersSent) {
        throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: e.message,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  private setupGDPRWebhooks() {
    /**
     * Customers can request their data from a store owner. When this happens,
     * Shopify invokes this webhook.
     *
     * https://shopify.dev/apps/webhooks/configuration/mandatory-webhooks#customers-data_request
     */
    Shopify.Webhooks.Registry.addHandler('CUSTOMERS_DATA_REQUEST', {
      path: this.path,
      webhookHandler: this.appService.handleCustomersDataRequest,
    });

    /**
     * Store owners can request that data is deleted on behalf of a customer. When
     * this happens, Shopify invokes this webhook.
     *
     * https://shopify.dev/apps/webhooks/configuration/mandatory-webhooks#customers-redact
     */
    Shopify.Webhooks.Registry.addHandler('CUSTOMERS_REDACT', {
      path: this.path,
      webhookHandler: this.appService.handleCustomersRedact,
    });

    /**
     * 48 hours after a store owner uninstalls your app, Shopify invokes this
     * webhook.
     *
     * https://shopify.dev/apps/webhooks/configuration/mandatory-webhooks#shop-redact
     */
    Shopify.Webhooks.Registry.addHandler('SHOP_REDACT', {
      path: this.path,
      webhookHandler: this.appService.handleShopRedact,
    });
  }

  private setupWebhooks() {
    this.setupGDPRWebhooks();

    Shopify.Webhooks.Registry.addHandler('APP_UNINSTALLED', {
      path: this.path,
      webhookHandler: this.appService.handleAppUninstall,
    });
  }
}
