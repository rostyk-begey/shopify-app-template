import { Card, Heading, Layout, Page, TextContainer } from '@shopify/polaris';

export const Analytics = () => (
  <Page title="Analytics">
    <Layout>
      <Layout.Section>
        <Card sectioned>
          <Heading>Heading</Heading>
          <TextContainer>
            <p>Body</p>
          </TextContainer>
        </Card>
        <Card sectioned>
          <Heading>Heading</Heading>
          <TextContainer>
            <p>Body</p>
          </TextContainer>
        </Card>
      </Layout.Section>
      <Layout.Section secondary>
        <Card sectioned>
          <Heading>Heading</Heading>
          <TextContainer>
            <p>Body</p>
          </TextContainer>
        </Card>
      </Layout.Section>
    </Layout>
  </Page>
);

export default Analytics;
