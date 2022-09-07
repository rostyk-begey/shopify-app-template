import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Shopify } from '@shopify/shopify-api';
import { Session } from '@shopify/shopify-api/dist/auth/session';

export const ShopifySession = createParamDecorator(
  async (
    data: unknown,
    ctx: ExecutionContext,
  ): Promise<Session | undefined> => {
    const http = ctx.switchToHttp();
    const request = http.getRequest();
    const response = http.getResponse();

    const session = await Shopify.Utils.loadCurrentSession(
      request,
      response,
      false,
    );

    return session;
  },
);
