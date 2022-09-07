import { Injectable } from '@nestjs/common';
import { Session } from '@shopify/shopify-api/dist/auth/session';
import { Shopify } from '@shopify/shopify-api';

const ADJECTIVES = [
  'autumn',
  'hidden',
  'bitter',
  'misty',
  'silent',
  'empty',
  'dry',
  'dark',
  'summer',
  'icy',
  'delicate',
  'quiet',
  'white',
  'cool',
  'spring',
  'winter',
  'patient',
  'twilight',
  'dawn',
  'crimson',
  'wispy',
  'weathered',
  'blue',
  'billowing',
  'broken',
  'cold',
  'damp',
  'falling',
  'frosty',
  'green',
  'long',
];

const NOUNS = [
  'waterfall',
  'river',
  'breeze',
  'moon',
  'rain',
  'wind',
  'sea',
  'morning',
  'snow',
  'lake',
  'sunset',
  'pine',
  'shadow',
  'leaf',
  'dawn',
  'glitter',
  'forest',
  'hill',
  'cloud',
  'meadow',
  'sun',
  'glade',
  'bird',
  'brook',
  'butterfly',
  'bush',
  'dew',
  'dust',
  'field',
  'fire',
  'flower',
];

export const DEFAULT_PRODUCTS_COUNT = 5;
const CREATE_PRODUCTS_MUTATION = `
  mutation populateProduct($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id
      }
    }
  }
`;

@Injectable()
export class ProductService {
  private randomTitle() {
    const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    return `${adjective} ${noun}`;
  }

  private randomPrice() {
    return Math.round((Math.random() * 10 + Number.EPSILON) * 100) / 100;
  }

  async count(session: Session) {
    const { Product } = await import(
      `@shopify/shopify-api/dist/rest-resources/2022-07/index.js`
    );

    return await Product.count({ session });
  }

  async create(session: Session, count = DEFAULT_PRODUCTS_COUNT) {
    const client = new Shopify.Clients.Graphql(
      session.shop,
      session.accessToken,
    );

    try {
      for (let i = 0; i < count; i++) {
        await client.query({
          data: {
            query: CREATE_PRODUCTS_MUTATION,
            variables: {
              input: {
                title: `${this.randomTitle()}`,
                variants: [{ price: this.randomPrice() }],
              },
            },
          },
        });
      }
    } catch (error) {
      if (error instanceof Shopify.Errors.GraphqlQueryError) {
        throw new Error(
          `${error.message}\n${JSON.stringify(error.response, null, 2)}`,
        );
      } else {
        throw error;
      }
    }
  }
}
