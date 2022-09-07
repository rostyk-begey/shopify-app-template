import { Request, Response } from 'express';
import { Injectable, Logger } from '@nestjs/common';
import { Shopify } from '@shopify/shopify-api';
import { API_ROUTES, UI_ROUTES } from '@google-shopify-crs/shared';
import { gdprTopics } from '@shopify/shopify-api/dist/webhooks/registry';
import { AuthQuery } from '@shopify/shopify-api/dist/auth/oauth/types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  async redirectToAuth(req: Request, res: Response) {
    if (!req.query.shop) {
      res.status(500);
      return res.send('No shop provided');
    }

    if (req.query.embedded === '1') {
      return this.clientSideRedirect(req, res);
    }

    return await this.serverSideRedirect(req, res);
  }

  private clientSideRedirect(req: Request, res: Response) {
    const shop = Shopify.Utils.sanitizeShop(req.query.shop as string);
    const redirectUriParams = new URLSearchParams({
      shop,
      host: req.query.host as string,
    }).toString();
    const queryParams = new URLSearchParams({
      ...req.query,
      shop,
      redirectUri: `https://${Shopify.Context.HOST_NAME}${API_ROUTES.AUTH.INDEX}?${redirectUriParams}`,
    }).toString();

    return res.redirect(`${UI_ROUTES.EXIT_IFRAME}?${queryParams}`);
  }

  private async serverSideRedirect(
    req: Request,
    res: Response,
    isOnline = false,
  ) {
    const redirectUrl = await Shopify.Auth.beginAuth(
      req,
      res,
      req.query.shop as string,
      API_ROUTES.AUTH.CALLBACK,
      isOnline,
    );

    return res.redirect(redirectUrl);
  }

  async authCallback(req: Request, res: Response) {
    try {
      const session = await Shopify.Auth.validateAuthCallback(
        req,
        res,
        req.query as unknown as AuthQuery,
      );

      const responses = await Shopify.Webhooks.Registry.registerAll({
        shop: session.shop,
        accessToken: session.accessToken,
      });

      Object.entries(responses).forEach(([topic, response]) => {
        // The response from registerAll will include errors for the GDPR topics.  These can be safely ignored.
        // To register the GDPR topics, please set the appropriate webhook endpoint in the
        // 'GDPR mandatory webhooks' section of 'App setup' in the Partners Dashboard.
        if (!response.success && !gdprTopics.includes(topic)) {
          this.logger.warn(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            `Failed to register ${topic} webhook: ${response.result.errors[0].message}`,
          );
        }
      });

      // If billing is required, check if the store needs to be charged right away to minimize the number of redirects.
      // if (billing.required) {
      //   const [hasPayment, confirmationUrl] = await ensureBilling(
      //     session,
      //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //     // @ts-ignore
      //     billing
      //   );
      //
      //   if (!hasPayment) {
      //     return res.redirect(confirmationUrl);
      //   }
      // }

      const host = Shopify.Utils.sanitizeHost(req.query.host as string);
      const redirectUrl = Shopify.Context.IS_EMBEDDED_APP
        ? Shopify.Utils.getEmbeddedAppUrl(req)
        : `/?shop=${session.shop}&host=${encodeURIComponent(host)}`;

      res.redirect(redirectUrl);
    } catch (e) {
      console.warn(e);
      switch (true) {
        case e instanceof Shopify.Errors.InvalidOAuthError:
          res.status(400);
          res.send(e.message);
          break;
        case e instanceof Shopify.Errors.CookieNotFound:
        case e instanceof Shopify.Errors.SessionNotFound:
          // This is likely because the OAuth session cookie expired before the merchant approved the request
          return this.redirectToAuth(req, res);
          break;
        default:
          res.status(500);
          res.send(e.message);
          break;
      }
    }
  }
}
