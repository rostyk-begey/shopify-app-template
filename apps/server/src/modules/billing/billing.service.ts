import { Injectable } from '@nestjs/common';
import { Shopify } from '@shopify/shopify-api';
import { Session } from '@shopify/shopify-api/dist/auth/session';
import { GraphqlClient } from '@shopify/shopify-api/dist/clients/graphql/graphql_client';
import { BillingConfig } from '../../types/config';
import { ConfigService } from '@nestjs/config';

const RECURRING_PURCHASES_QUERY = `
  query appSubscription {
    currentAppInstallation {
      activeSubscriptions {
        name, test
      }
    }
  }
`;

const ONE_TIME_PURCHASES_QUERY = `
  query appPurchases($endCursor: String) {
    currentAppInstallation {
      oneTimePurchases(first: 250, sortKey: CREATED_AT, after: $endCursor) {
        edges {
          node {
            name, test, status
          }
        }
        pageInfo {
          hasNextPage, endCursor
        }
      }
    }
  }
`;

const RECURRING_PURCHASE_MUTATION = `
  mutation test(
    $name: String!
    $lineItems: [AppSubscriptionLineItemInput!]!
    $returnUrl: URL!
    $test: Boolean
  ) {
    appSubscriptionCreate(
      name: $name
      lineItems: $lineItems
      returnUrl: $returnUrl
      test: $test
    ) {
      confirmationUrl
      userErrors {
        field
        message
      }
    }
  }
`;

const ONE_TIME_PURCHASE_MUTATION = `
  mutation test(
    $name: String!
    $price: MoneyInput!
    $returnUrl: URL!
    $test: Boolean
  ) {
    appPurchaseOneTimeCreate(
      name: $name
      price: $price
      returnUrl: $returnUrl
      test: $test
    ) {
      confirmationUrl
      userErrors {
        field
        message
      }
    }
  }
`;

export const BillingInterval = {
  OneTime: 'ONE_TIME',
  Every30Days: 'EVERY_30_DAYS',
  Annual: 'ANNUAL',
};

const RECURRING_INTERVALS = [
  BillingInterval.Every30Days,
  BillingInterval.Annual,
];

export function ShopifyBillingError(message, errorData) {
  this.name = 'ShopifyBillingError';
  this.stack = new Error().stack;

  this.message = message;
  this.errorData = errorData;
}
ShopifyBillingError.prototype = new Error();

@Injectable()
export class BillingService {
  private readonly isProd: boolean;
  private readonly billing: BillingConfig;

  constructor(private readonly configService: ConfigService) {
    this.billing = configService.get('billing', { infer: true });
    this.billing = configService.get('production', { infer: true });
  }

  /**
   * You may want to charge merchants for using your app. This helper provides that function by checking if the current
   * merchant has an active one-time payment or subscription named `chargeName`. If no payment is found,
   * this helper requests it and returns a confirmation URL so that the merchant can approve the purchase.
   *
   * Learn more about billing in our documentation: https://shopify.dev/apps/billing
   */
  async ensureBilling(session: Session) {
    if (!Object.values(BillingInterval).includes(this.billing.interval)) {
      throw `Unrecognized billing interval '${this.billing.interval}'`;
    }

    let hasPayment;
    let confirmationUrl = null;

    if (await this.hasActivePayment(session)) {
      hasPayment = true;
    } else {
      hasPayment = false;
      confirmationUrl = await this.requestPayment(session);
    }

    return [hasPayment, confirmationUrl];
  }

  isRecurring(interval: string) {
    return RECURRING_INTERVALS.includes(interval);
  }

  async hasActivePayment(session: Session) {
    const client = new Shopify.Clients.Graphql(
      session.shop,
      session.accessToken,
    );

    if (this.isRecurring(this.billing.interval)) {
      const currentInstallations = await client.query({
        data: RECURRING_PURCHASES_QUERY,
      });
      const subscriptions =
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        currentInstallations.body.data.currentAppInstallation
          .activeSubscriptions;

      const hasActiveSubscription = subscriptions.some(
        ({ name, test }) =>
          name === this.billing.chargeName && (!this.isProd || !test),
      );
      if (hasActiveSubscription) {
        return true;
      }
    } else {
      let purchases;
      let endCursor = null;
      do {
        const currentInstallations = await client.query({
          data: {
            query: ONE_TIME_PURCHASES_QUERY,
            variables: { endCursor },
          },
        });
        purchases =
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          currentInstallations.body.data.currentAppInstallation
            .oneTimePurchases;

        const hasActivePayment = purchases.edges.some(
          ({ node }) =>
            node.name === this.billing.chargeName &&
            (!this.isProd || !node.test) &&
            node.status === 'ACTIVE',
        );
        if (hasActivePayment) {
          return true;
        }

        endCursor = purchases.pageInfo.endCursor;
      } while (purchases.pageInfo.hasNextPage);
    }

    return false;
  }

  async requestPayment(session: Session) {
    const client = new Shopify.Clients.Graphql(
      session.shop,
      session.accessToken,
    );
    const returnUrl = `https://${Shopify.Context.HOST_NAME}?shop=${
      session.shop
    }&host=${Buffer.from(`${session.shop}/admin`).toString('base64')}`;

    let data;
    if (this.isRecurring(this.billing.interval)) {
      const mutationResponse = await this.requestRecurringPayment(
        client,
        returnUrl,
      );
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      data = mutationResponse.body.data.appSubscriptionCreate;
    } else {
      const mutationResponse = await this.requestSinglePayment(
        client,
        returnUrl,
      );

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      data = mutationResponse.body.data.appPurchaseOneTimeCreate;
    }

    if (data.userErrors.length) {
      throw new ShopifyBillingError(
        'Error while billing the store',
        data.userErrors,
      );
    }

    return data.confirmationUrl;
  }

  async requestRecurringPayment(client: GraphqlClient, returnUrl: string) {
    const mutationResponse = await client.query({
      data: {
        query: RECURRING_PURCHASE_MUTATION,
        variables: {
          name: this.billing.chargeName,
          lineItems: [
            {
              plan: {
                appRecurringPricingDetails: {
                  interval: this.billing.interval,
                  price: {
                    amount: this.billing.amount,
                    currencyCode: this.billing.currencyCode,
                  },
                },
              },
            },
          ],
          returnUrl,
          test: !this.isProd,
        },
      },
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (mutationResponse.body.errors && mutationResponse.body.errors.length) {
      throw new ShopifyBillingError(
        'Error while billing the store',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        mutationResponse.body.errors,
      );
    }

    return mutationResponse;
  }

  async requestSinglePayment(client: GraphqlClient, returnUrl: string) {
    const mutationResponse = await client.query({
      data: {
        query: ONE_TIME_PURCHASE_MUTATION,
        variables: {
          name: this.billing.chargeName,
          price: {
            amount: this.billing.amount,
            currencyCode: this.billing.currencyCode,
          },
          returnUrl,
          test: !this.isProd,
        },
      },
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (mutationResponse.body.errors && mutationResponse.body.errors.length) {
      throw new ShopifyBillingError(
        'Error while billing the store',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        mutationResponse.body.errors,
      );
    }

    return mutationResponse;
  }
}
