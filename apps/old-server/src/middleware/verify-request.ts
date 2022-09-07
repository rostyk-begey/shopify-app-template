import { Shopify } from '@shopify/shopify-api';
import { Express } from 'express';
import {
  ensureBilling,
  redirectToAuth,
  returnTopLevelRedirection,
  ShopifyBillingError,
} from '../helpers';
import { API_ROUTES } from '@google-shopify-crs/shared';

const TEST_GRAPHQL_QUERY = `
{
  shop {
    name
  }
}`;

export const verifyRequest =
  (
    app: Express,
    { billing = { required: false } } = { billing: { required: false } },
  ) =>
  async (req, res, next) => {
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get('use-online-tokens'),
    );

    let shop = Shopify.Utils.sanitizeShop(req.query.shop);
    if (session && shop && session.shop !== shop) {
      // The current request is for a different shop. Redirect gracefully.
      return redirectToAuth(req, res, app);
    }

    if (session?.isActive()) {
      try {
        if (billing.required) {
          // The request to check billing status serves to validate that the access token is still valid.
          const [hasPayment, confirmationUrl] = await ensureBilling(
            session,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            billing,
          );

          if (!hasPayment) {
            returnTopLevelRedirection(req, res, confirmationUrl);
            return;
          }
        } else {
          // Make a request to ensure the access token is still valid. Otherwise, re-authenticate the user.
          const client = new Shopify.Clients.Graphql(
            session.shop,
            session.accessToken,
          );
          await client.query({ data: TEST_GRAPHQL_QUERY });
        }
        return next();
      } catch (e) {
        if (
          e instanceof Shopify.Errors.HttpResponseError &&
          e.response.code === 401
        ) {
          // Re-authenticate if we get a 401 response
        } else if (e instanceof ShopifyBillingError) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          console.error(e.message, e.errorData[0]);
          res.status(500).end();
          return;
        } else {
          throw e;
        }
      }
    }

    const bearerPresent = req.headers.authorization?.match(/Bearer (.*)/);
    if (bearerPresent) {
      if (!shop) {
        if (session) {
          shop = session.shop;
        } else if (Shopify.Context.IS_EMBEDDED_APP) {
          if (bearerPresent) {
            const payload = Shopify.Utils.decodeSessionToken(bearerPresent[1]);
            shop = payload.dest.replace('https://', '');
          }
        }
      }
    }

    returnTopLevelRedirection(
      req,
      res,
      `${API_ROUTES.AUTH.INDEX}?shop=${encodeURIComponent(shop)}`,
    );
  };
