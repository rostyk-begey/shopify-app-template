import { Stack, Card, Layout, Page, ResourceList } from '@shopify/polaris';

export const Catalog = () => (
  <Page title="Catalog">
    <Layout>
      <Layout.Section oneHalf>
        <Card
          sectioned
          title="Branch 0"
          primaryFooterAction={{ content: 'Full reindex' }}
        >
          <ResourceList
            resourceName={{ singular: 'sale', plural: 'sales' }}
            items={[
              {
                sales: 'Status',
                amount: 'Indexing completed',
              },
              {
                sales: 'Products in stock',
                amount: '73,724',
              },
              {
                sales: 'Total stock',
                amount: '73,724',
              },
              {
                sales: 'Last import',
                amount: 'May 24, 2022',
              },
              {
                sales: 'Intraday update ',
                amount: 'May 24, 2022',
              },
              {
                sales: 'Errors',
                amount: '0',
              },
            ]}
            renderItem={({ sales, amount }, id) => (
              <ResourceList.Item id={id} onClick={() => null}>
                <Stack>
                  <Stack.Item fill>{sales}</Stack.Item>
                  <Stack.Item>{amount}</Stack.Item>
                </Stack>
              </ResourceList.Item>
            )}
          />
        </Card>
      </Layout.Section>
      <Layout.Section oneHalf>
        <Card
          sectioned
          title="Events"
          primaryFooterAction={{ content: 'Manual upload' }}
        >
          <ResourceList
            resourceName={{ singular: 'sale', plural: 'sales' }}
            items={[
              {
                sales: 'Status',
                amount: 'Indexing completed',
              },
              {
                sales: 'Products in stock',
                amount: '73,724',
              },
              {
                sales: 'Total stock',
                amount: '73,724',
              },
              {
                sales: 'Last import',
                amount: 'May 24, 2022',
              },
              {
                sales: 'Intraday update ',
                amount: 'May 24, 2022',
              },
              {
                sales: 'Errors',
                amount: '0',
              },
            ]}
            renderItem={({ sales, amount }, id) => (
              <ResourceList.Item id={id} onClick={() => null}>
                <Stack>
                  <Stack.Item fill>{sales}</Stack.Item>
                  <Stack.Item>{amount}</Stack.Item>
                </Stack>
              </ResourceList.Item>
            )}
          />
        </Card>
      </Layout.Section>
    </Layout>
  </Page>
);

export default Catalog;
