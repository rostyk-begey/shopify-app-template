import { Shopify } from '@shopify/shopify-api';
import { API_ROUTES, UI_ROUTES } from '@google-shopify-crs/shared';

export const redirectToAuth = async (req, res, app) => {
  if (!req.query.shop) {
    res.status(500);
    return res.send('No shop provided');
  }

  if (req.query.embedded === '1') {
    return clientSideRedirect(req, res);
  }

  return await serverSideRedirect(req, res, app);
};

const clientSideRedirect = (req, res) => {
  const shop = Shopify.Utils.sanitizeShop(req.query.shop);
  const redirectUriParams = new URLSearchParams({
    shop,
    host: req.query.host,
  }).toString();
  const queryParams = new URLSearchParams({
    ...req.query,
    shop,
    redirectUri: `https://${Shopify.Context.HOST_NAME}${API_ROUTES.AUTH.INDEX}?${redirectUriParams}`,
  }).toString();

  return res.redirect(`${UI_ROUTES.EXIT_IFRAME}?${queryParams}`);
};

const serverSideRedirect = async (req, res, app) => {
  const redirectUrl = await Shopify.Auth.beginAuth(
    req,
    res,
    req.query.shop,
    API_ROUTES.AUTH.CALLBACK,
    app.get('use-online-tokens'),
  );

  return res.redirect(redirectUrl);
};
