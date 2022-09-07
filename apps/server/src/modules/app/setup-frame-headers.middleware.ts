import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Shopify } from '@shopify/shopify-api';

@Injectable()
export class SetupFrameHeadersMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const shop = Shopify.Utils.sanitizeShop(req.query.shop as string);

    if (Shopify.Context.IS_EMBEDDED_APP && shop) {
      res.setHeader(
        'Content-Security-Policy',
        `frame-ancestors https://${encodeURIComponent(
          shop,
        )} https://admin.shopify.com;`,
      );
    } else {
      res.setHeader('Content-Security-Policy', `frame-ancestors 'none';`);
    }

    next();
  }
}
