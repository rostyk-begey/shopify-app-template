import { BrowserRouter } from 'react-router-dom';
import { NavigationMenu } from '@shopify/app-bridge-react';
import { UI_ROUTES } from '@google-shopify-crs/shared';
import {
  AppBridgeProvider,
  PolarisProvider,
  QueryProvider,
  RoutePages,
  Routes,
} from './components';

// Any .tsx or .jsx files in /pages will become a route
const pages: RoutePages = import.meta.glob(
  './pages/**/!(*.test.[jt]sx)*.([jt]sx)',
  {
    eager: true,
    import: 'default',
  },
);

export const App = () => (
  <BrowserRouter>
    <PolarisProvider>
      <QueryProvider>
        <AppBridgeProvider>
          <NavigationMenu
            navigationLinks={[
              {
                label: 'Sample page',
                destination: UI_ROUTES.SAMPLE_PAGE,
              },
            ]}
          />
          <Routes pages={pages} />
        </AppBridgeProvider>
      </QueryProvider>
    </PolarisProvider>
  </BrowserRouter>
);
