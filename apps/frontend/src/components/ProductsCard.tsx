import { useState } from 'react';
import {
  Card,
  Heading,
  TextContainer,
  DisplayText,
  TextStyle,
} from '@shopify/polaris';
import { Toast, ToastProps } from '@shopify/app-bridge-react';
import { useAppQuery, useAuthenticatedFetch } from '../hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ROUTES } from '@google-shopify-crs/shared';

export function ProductsCard() {
  const emptyToastProps = { content: '' } as ToastProps;
  const [toastProps, setToastProps] = useState<ToastProps>(emptyToastProps);
  const fetch = useAuthenticatedFetch();
  const queryClient = useQueryClient();

  const countQuery = useAppQuery({ url: API_ROUTES.PRODUCTS.COUNT });

  const createProductsMutation = useMutation(
    () => fetch(API_ROUTES.PRODUCTS.CREATE),
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries([API_ROUTES.PRODUCTS.COUNT]);
        setToastProps({ content: '5 products created!' } as ToastProps);
      },
      onError: () => {
        setToastProps({
          content: 'There was an error creating products',
          error: true,
        } as ToastProps);
      },
    }
  );

  const isLoading = countQuery.isLoading || createProductsMutation.isLoading;

  const toastMarkup = toastProps.content && !countQuery.isRefetching && (
    <Toast {...toastProps} onDismiss={() => setToastProps(emptyToastProps)} />
  );

  return (
    <>
      {toastMarkup}
      <Card
        title="Product Counter"
        sectioned
        primaryFooterAction={{
          content: 'Populate 5 products',
          onAction: createProductsMutation.mutate,
          loading: isLoading,
        }}
      >
        <TextContainer spacing="loose">
          <p>
            Sample products are created with a default title and price. You can
            remove them at any time.
          </p>
          <Heading element="h4">
            TOTAL PRODUCTS
            <DisplayText size="medium">
              <TextStyle variation="strong">
                {isLoading ? '-' : countQuery.data.count}
              </TextStyle>
            </DisplayText>
          </Heading>
        </TextContainer>
      </Card>
    </>
  );
}
