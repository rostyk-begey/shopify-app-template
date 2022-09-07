import { join } from 'path';
import { readFileSync } from 'fs';
import express from 'express';
import cookieParser from 'cookie-parser';
import { Shopify, LATEST_API_VERSION } from '@shopify/shopify-api';
import { API_ROUTES } from '@google-shopify-crs/shared';

import {
  applyAuthMiddleware,
  setupWebhooks,
  verifyRequest,
} from './middleware';
import { productCreator, redirectToAuth } from './helpers';
import { AppInstallations } from './app-installations';
import { setupFrameHeaders } from './middleware/frame-headers';

const USE_ONLINE_TOKENS = false;

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || process.env.port,
  10,
);

const STATIC_PATH = join(process.cwd(), process.env.STATIC_PATH);

const DB_PATH = `${process.cwd()}/database.sqlite`;

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SCOPES.split(','),
  HOST_NAME: process.env.HOST.replace(/https?:\/\//, ''),
  HOST_SCHEME: process.env.HOST.split('://')[0],
  API_VERSION: LATEST_API_VERSION,
  IS_EMBEDDED_APP: true,
  // This should be replaced with your preferred storage strategy
  SESSION_STORAGE: new Shopify.Session.SQLiteSessionStorage(DB_PATH),
});

// The transactions with Shopify will always be marked as test transactions, unless NODE_ENV is production.
// See the ensureBilling helper to learn more about billing in this template.
const BILLING_SETTINGS = {
  required: false,
  // This is an example configuration that would do a one-time charge for $5 (only USD is currently supported)
  // chargeName: "My Shopify One-Time Charge",
  // amount: 5.0,
  // currencyCode: "USD",
  // interval: BillingInterval.OneTime,
};

// export for test use only
export const createServer = async (
  root = process.cwd(),
  isProd = process.env.NODE_ENV === 'production',
  billingSettings = BILLING_SETTINGS,
) => {
  const app = express();

  app.set('use-online-tokens', USE_ONLINE_TOKENS);
  app.use(cookieParser(Shopify.Context.API_SECRET_KEY));

  applyAuthMiddleware(app, {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    billing: billingSettings,
  });

  // Do not call app.use(express.json()) before processing webhooks with
  // Shopify.Webhooks.Registry.process().
  // See https://github.com/Shopify/shopify-api-node/blob/main/docs/usage/webhooks.md#note-regarding-use-of-body-parsers
  // for more details.
  setupWebhooks(app);

  // All endpoints after this point will have access to a request.body
  // attribute, as a result of the express.json() middleware
  app.use(express.json());

  // All endpoints after this point will require an active session
  app.use(
    '/api/*',
    verifyRequest(app, {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      billing: billingSettings,
    }),
  );

  app.get(API_ROUTES.PRODUCTS.COUNT, async (req, res) => {
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get('use-online-tokens'),
    );

    const { Product } = await import(
      `@shopify/shopify-api/dist/rest-resources/2022-07/index.js`
    );

    const countData = await Product.count({ session });
    res.status(200).json(countData);
  });

  app.get(API_ROUTES.PRODUCTS.CREATE, async (req, res) => {
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get('use-online-tokens'),
    );
    let status = 200;
    let error = null;

    try {
      await productCreator(session);
    } catch (e) {
      console.log(`Failed to process products/create: ${e.message}`);
      status = 500;
      error = e.message;
    }
    res.status(status).send({ success: status === 200, error });
  });

  setupFrameHeaders(app);

  if (isProd) {
    const compression = await import('compression').then(
      ({ default: fn }) => fn,
    );
    const serveStatic = await import('serve-static').then(
      ({ default: fn }) => fn,
    );
    app.use(compression());
    app.use(serveStatic(STATIC_PATH, { index: false }));
  }

  app.use('/*', async (req, res, next) => {
    if (typeof req.query.shop !== 'string') {
      res.status(500);
      return res.send('No shop provided');
    }

    const shop = Shopify.Utils.sanitizeShop(req.query.shop);
    const appInstalled = await AppInstallations.includes(shop);

    if (!appInstalled) {
      return redirectToAuth(req, res, app);
    }

    if (Shopify.Context.IS_EMBEDDED_APP && req.query.embedded !== '1') {
      const embeddedUrl = Shopify.Utils.getEmbeddedAppUrl(req);
      return res.redirect(embeddedUrl + req.path);
    }

    const htmlFile = join(STATIC_PATH, 'index.html');

    return res
      .status(200)
      .set('Content-Type', 'text/html')
      .send(readFileSync(htmlFile));
  });

  return app;
};

createServer()
  .then((app) => app.listen(PORT))
  .then(() => console.log(`Server listening on port ${PORT}`));
