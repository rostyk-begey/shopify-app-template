import { useState, useCallback } from 'react';
import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
  Link,
  Heading,
  AccountConnection,
} from '@shopify/polaris';

import { ProductsCard } from '../components';
import { trophyImage } from '../assets';

const AccountConnectionExample = () => {
  const [connected, setConnected] = useState(false);
  const accountName = connected ? 'Jane Appleseed' : '';

  const handleAction = useCallback(() => {
    setConnected((connected) => !connected);
  }, []);

  const buttonText = connected ? 'Disconnect' : 'Connect';
  const details = connected ? 'Account connected' : 'No account connected';
  const terms = connected ? null : (
    <p>
      By clicking <strong>Connect</strong>, you agree to accept Sample App’s{' '}
      <Link url="Example App">terms and conditions</Link>. You’ll pay a
      commission rate of 15% on sales made through Sample App.
    </p>
  );

  return (
    <AccountConnection
      accountName={accountName}
      connected={connected}
      title="Example App"
      action={{
        content: buttonText,
        onAction: handleAction,
      }}
      details={details}
      termsOfService={terms}
    />
  );
};

const HomePage = () => (
  <Page narrowWidth>
    <Layout>
      <Layout.Section>
        <AccountConnectionExample />
      </Layout.Section>
      <Layout.Section>
        <Card sectioned>
          <Stack
            wrap={false}
            spacing="extraTight"
            distribution="trailing"
            alignment="center"
          >
            <Stack.Item fill>
              <TextContainer spacing="loose">
                <Heading>Nice work on building a Shopify app 🎉</Heading>
                <p>
                  Your app is ready to explore! It contains everything you need
                  to get started including the{' '}
                  <Link url="https://polaris.shopify.com/" external>
                    Polaris design system
                  </Link>
                  ,{' '}
                  <Link url="https://shopify.dev/api/admin-graphql" external>
                    Shopify Admin API
                  </Link>
                  , and{' '}
                  <Link
                    url="https://shopify.dev/apps/tools/app-bridge"
                    external
                  >
                    App Bridge
                  </Link>{' '}
                  UI library and components.
                </p>
                <p>
                  Ready to go? Start populating your app with some sample
                  products to view and test in your store.{' '}
                </p>
                <p>
                  Learn more about building out your app in{' '}
                  <Link
                    url="https://shopify.dev/apps/getting-started/add-functionality"
                    external
                  >
                    this Shopify tutorial
                  </Link>{' '}
                  📚{' '}
                </p>
              </TextContainer>
            </Stack.Item>
            <Stack.Item>
              <div style={{ padding: '0 20px' }}>
                <Image
                  source={trophyImage}
                  alt="Nice work on building a Shopify app"
                  width={120}
                />
              </div>
            </Stack.Item>
          </Stack>
        </Card>
      </Layout.Section>
      <Layout.Section>
        <ProductsCard />
      </Layout.Section>
    </Layout>
  </Page>
);

export default HomePage;
