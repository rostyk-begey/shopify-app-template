import { ReactNode } from 'react';
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

const queryCache = new QueryCache();
const mutationCache = new MutationCache();

export const queryClient = new QueryClient({ queryCache, mutationCache });

export const QueryProvider = ({
  children,
}: {
  children: ReactNode | ReactNode[];
}) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
