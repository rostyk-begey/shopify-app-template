import { Icon } from '@shopify/polaris';
import {
  AdjustMinor,
  AnalyticsMajor,
  HomeMajor,
  NoteMajor,
} from '@shopify/polaris-icons';
import { UI_ROUTES } from '@google-shopify-crs/shared';
import { TabDescriptor } from '@shopify/polaris/build/ts/latest/src/components/Tabs/types';

export const TABS: TabDescriptor[] = [
  {
    id: 'dashboard-1',
    content: (
      <div style={{ display: 'inline-flex' }}>
        <Icon source={HomeMajor} />{' '}
        <span style={{ marginLeft: 8 }}>Dashboard</span>
      </div>
    ),
    url: UI_ROUTES.DASHBOARD,
    accessibilityLabel: 'Dashboard',
    panelID: 'dashboard-1',
  },
  {
    id: 'catalog-1',
    content: (
      <div style={{ display: 'inline-flex' }}>
        <Icon source={NoteMajor} />{' '}
        <span style={{ marginLeft: 8 }}>Catalog</span>
      </div>
    ),
    url: UI_ROUTES.CATALOG,
    accessibilityLabel: 'Catalog',
    panelID: 'catalog-content-1',
  },
  {
    id: 'rules-merchandising-1',
    content: (
      <div style={{ display: 'inline-flex' }}>
        <Icon source={AdjustMinor} />{' '}
        <span style={{ marginLeft: 8 }}>Rules merchandising</span>
      </div>
    ),
    url: UI_ROUTES.RULES_MERCHANDISING,
    panelID: 'rules-merchandising-content-1',
  },
  {
    id: 'analytics-1',
    content: (
      <div style={{ display: 'inline-flex' }}>
        <Icon source={AnalyticsMajor} />{' '}
        <span style={{ marginLeft: 8 }}>Analytics</span>
      </div>
    ),
    url: UI_ROUTES.ANALYTICS,
    panelID: 'analytics-content-1',
  },
];
