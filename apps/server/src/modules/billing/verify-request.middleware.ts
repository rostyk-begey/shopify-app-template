import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Shopify } from '@shopify/shopify-api';
import { API_ROUTES } from '@google-shopify-crs/shared';
import { AuthService } from '../auth/auth.service';
import { BillingService, ShopifyBillingError } from './billing.service';
import { BillingConfig } from '../../types/config';
import { ConfigService } from '@nestjs/config';

const TEST_GRAPHQL_QUERY = `
{
  shop {
    name
  }
}`;

@Injectable()
export class VerifyRequestMiddleware implements NestMiddleware {
  private readonly isOnline: boolean;
  private readonly billing: BillingConfig;

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly billingService: BillingService,
  ) {
    this.billing = configService.get('billing', { infer: true });
    this.isOnline = configService.get('useOnlineTokens', { infer: true });
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      this.isOnline,
    );

    let shop = Shopify.Utils.sanitizeShop(req.query.shop as string);
    if (session && shop && session.shop !== shop) {
      // The current request is for a different shop. Redirect gracefully.
      return this.authService.redirectToAuth(req, res);
    }

    if (session?.isActive()) {
      try {
        if (this.billing.required) {
          // The request to check billing status serves to validate that the access token is still valid.
          const [hasPayment, confirmationUrl] =
            await this.billingService.ensureBilling(
              session,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              billing,
            );

          if (!hasPayment) {
            this.returnTopLevelRedirection(req, res, confirmationUrl);
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

    this.returnTopLevelRedirection(
      req,
      res,
      `${API_ROUTES.AUTH.INDEX}?shop=${encodeURIComponent(shop)}`,
    );
  }

  private returnTopLevelRedirection(
    req: Request,
    res: Response,
    redirectUrl: string,
  ) {
    const bearerPresent = req.headers.authorization?.match(/Bearer (.*)/);

    // If the request has a bearer token, the app is currently embedded, and must break out of the iframe to
    // re-authenticate
    if (bearerPresent) {
      res.status(403);
      res.header('X-Shopify-API-Request-Failure-Reauthorize', '1');
      res.header('X-Shopify-API-Request-Failure-Reauthorize-Url', redirectUrl);
      res.end();
    } else {
      res.redirect(redirectUrl);
    }
  }
}
