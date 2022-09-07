import { Shopify } from '@shopify/shopify-api';

export const AppInstallations = {
  includes: async (shopDomain) => {
    const shopSessions =
      await Shopify.Context.SESSION_STORAGE.findSessionsByShop(shopDomain);

    const hasShopSession = shopSessions.some(({ accessToken }) => accessToken);

    return hasShopSession;
  },

  delete: async (shopDomain) => {
    const shopSessions =
      await Shopify.Context.SESSION_STORAGE.findSessionsByShop(shopDomain);

    if (shopSessions.length > 0) {
      await Shopify.Context.SESSION_STORAGE.deleteSessions(
        shopSessions.map((session) => session.id),
      );
    }
  },
};
