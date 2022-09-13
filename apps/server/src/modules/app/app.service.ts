import { Injectable, Logger } from '@nestjs/common';
import { Shopify } from '@shopify/shopify-api';
import { ConfigService } from '@nestjs/config';
import { ShopifyConfig } from '../../types/config';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  private readonly shopifyConfig: ShopifyConfig;

  constructor(private readonly configService: ConfigService) {
    this.shopifyConfig = configService.get('shopify', { infer: true });
  }

  init() {
    Shopify.Context.initialize({
      API_KEY: this.shopifyConfig.apiKey,
      API_SECRET_KEY: this.shopifyConfig.apiSecret,
      SCOPES: this.shopifyConfig.scopes,
      HOST_NAME: this.shopifyConfig.hostName,
      HOST_SCHEME: this.shopifyConfig.hostScheme,
      API_VERSION: this.shopifyConfig.apiVersion,
      IS_EMBEDDED_APP: this.shopifyConfig.isEmbeddedApp,
      // This should be replaced with your preferred storage strategy
      SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
    });

    this.logger.log('Shopify app initialized');
  }

  async isAppInstalled(shopDomain: string) {
    const shopSessions =
      await Shopify.Context.SESSION_STORAGE.findSessionsByShop(shopDomain);

    const hasShopSession = shopSessions.some(({ accessToken }) => accessToken);

    return hasShopSession;
  }

  async handleShopRedact(
    topic: string,
    shopDomain: string,
    body: string,
  ): Promise<void> {
    const payload = JSON.parse(body);
    // Payload has the following shape:
    // {
    //   "shop_id": 954889,
    //   "shop_domain": "{shop}.myshopify.com"
    // }
  }

  async handleCustomersDataRequest(
    topic: string,
    shopDomain: string,
    body: string,
  ): Promise<void> {
    const payload = JSON.parse(body);
    // Payload has the following shape:
    // {
    //   "shop_id": 954889,
    //   "shop_domain": "{shop}.myshopify.com",
    //   "orders_requested": [
    //     299938,
    //     280263,
    //     220458
    //   ],
    //   "customer": {
    //     "id": 191167,
    //     "email": "john@example.com",
    //     "phone": "555-625-1199"
    //   },
    //   "data_request": {
    //     "id": 9999
    //   }
    // }
  }

  async handleCustomersRedact(
    topic: string,
    shopDomain: string,
    body: string,
  ): Promise<void> {
    const payload = JSON.parse(body);
    // Payload has the following shape:
    // {
    //   "shop_id": 954889,
    //   "shop_domain": "{shop}.myshopify.com",
    //   "customer": {
    //     "id": 191167,
    //     "email": "john@example.com",
    //     "phone": "555-625-1199"
    //   },
    //   "orders_to_redact": [
    //     299938,
    //     280263,
    //     220458
    //   ]
    // }
  }

  async handleAppUninstall(
    topic: string,
    shopDomain: string,
    body: string,
  ): Promise<void> {
    const shopSessions =
      await Shopify.Context.SESSION_STORAGE.findSessionsByShop(shopDomain);

    if (shopSessions.length > 0) {
      await Shopify.Context.SESSION_STORAGE.deleteSessions(
        shopSessions.map((session) => session.id),
      );
    }
  }
}
