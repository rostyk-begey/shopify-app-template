import { Tabs } from '@shopify/polaris';
import { useLocation, useNavigate } from 'react-router-dom';
import { TABS } from '../lib/tabs';
import { RoutePages, Routes } from './Routes';

// Any .tsx or .jsx files in /pages will become a route
const pages: RoutePages = import.meta.glob(
  '../pages/**/!(*.test.[jt]sx)*.([jt]sx)',
  {
    eager: true,
    import: 'default',
  }
);

export const TabPages = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const selectedTab = TABS.findIndex(({ url }) => url === pathname);

  return (
    <Tabs
      tabs={TABS}
      selected={selectedTab}
      onSelect={(index) => navigate(TABS[index].url as string)}
    >
      <Routes pages={pages} />
    </Tabs>
  );
};
