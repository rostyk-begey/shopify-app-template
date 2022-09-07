import { LATEST_API_VERSION } from '@shopify/shopify-api';
import { join } from 'path';
import { BillingInterval, Config } from '../types/config';

export const load = (): Config => ({
  production: true,
  port: parseInt(
    process.env.BACKEND_PORT || process.env.PORT || process.env.port,
    10,
  ),
  dbPath: `${process.cwd()}/database.sqlite`,
  staticsPath: join(process.cwd(), process.env.STATIC_PATH),
  useOnlineTokens: false,
  billing: {
    required: false,
    chargeName: '',
    amount: 0,
    currencyCode: '',
    interval: BillingInterval.OneTime,
  },
  shopify: {
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecret: process.env.SHOPIFY_API_SECRET,
    scopes: process.env.SCOPES.split(','),
    hostName: process.env.HOST.replace(/https?:\/\//, ''),
    hostScheme: process.env.HOST.split('://')[0],
    apiVersion: LATEST_API_VERSION,
    isEmbeddedApp: true,
  },
});
