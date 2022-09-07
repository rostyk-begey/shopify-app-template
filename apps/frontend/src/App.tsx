import { BrowserRouter } from 'react-router-dom';

import {
  AppBridgeProvider,
  PolarisProvider,
  QueryProvider,
  TabPages,
} from './components';
import './assets/index.scss';

export const App = () => (
  <BrowserRouter>
    <PolarisProvider>
      <QueryProvider>
        <AppBridgeProvider>
          <TabPages />
        </AppBridgeProvider>
      </QueryProvider>
    </PolarisProvider>
  </BrowserRouter>
);
