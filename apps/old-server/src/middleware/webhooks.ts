import { Express } from 'express';
import { API_ROUTES } from '@google-shopify-crs/shared';
import { Shopify } from '@shopify/shopify-api';
import { AppInstallations } from '../app-installations';
import { setupGDPRWebHooks } from '../gdpr';

export const setupWebhooks = (app: Express) => {
  // This sets up the mandatory GDPR webhooks. You’ll need to fill in the endpoint
  // in the “GDPR mandatory webhooks” section in the “App setup” tab, and customize
  // the code when you store customer data.
  //
  // More details can be found on shopify.dev:
  // https://shopify.dev/apps/webhooks/configuration/mandatory-webhooks
  setupGDPRWebHooks(API_ROUTES.WEBHOOKS.INDEX);

  Shopify.Webhooks.Registry.addHandler('APP_UNINSTALLED', {
    path: API_ROUTES.WEBHOOKS.INDEX,
    webhookHandler: async (_topic, shop, _body) => {
      await AppInstallations.delete(shop);
    },
  });

  app.post(API_ROUTES.WEBHOOKS.INDEX, async (req, res) => {
    try {
      await Shopify.Webhooks.Registry.process(req, res);
      console.log(`Webhook processed, returned status code 200`);
    } catch (e) {
      console.log(`Failed to process webhook: ${e.message}`);
      if (!res.headersSent) {
        res.status(500).send(e.message);
      }
    }
  });
};
