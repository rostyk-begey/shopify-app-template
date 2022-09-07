import { ApiVersion } from '@shopify/shopify-api/dist/base-types';

export enum BillingInterval {
  OneTime = 'ONE_TIME',
  Every30Days = 'EVERY_30_DAYS',
  Annual = 'ANNUAL',
}

export type ShopifyConfig = {
  apiKey: string;
  apiSecret: string;
  scopes: string[];
  hostName: string;
  hostScheme: string;
  apiVersion: ApiVersion;
  isEmbeddedApp: boolean;
};

// The transactions with Shopify will always be marked as test transactions, unless NODE_ENV is production.
export type BillingConfig = {
  required: boolean;
  chargeName: string;
  amount: number;
  currencyCode: string;
  interval: BillingInterval;
};

export type Config = {
  production: boolean;
  port: number;
  dbPath: string;
  staticsPath: string;
  useOnlineTokens: boolean;
  shopify: ShopifyConfig;
  billing: BillingConfig;
};
