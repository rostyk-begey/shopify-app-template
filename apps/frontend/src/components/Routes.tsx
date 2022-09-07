import type { ReactElement } from 'react';
import { Routes as ReactRouterRoutes, Route } from 'react-router-dom';
import { UI_ROUTES } from '@google-shopify-crs/shared';
import { useRoutes } from '../hooks';

export type RoutePages = Record<string, () => ReactElement>;

export type RoutesProps = {
  pages: RoutePages;
};

/**
 * File-based routing.
 * @desc File-based routing that uses React Router under the hood.
 * To create a new route create a new .jsx file in `/pages` with a default export.
 *
 * Some examples:
 * * `/pages/index.jsx` matches `/`
 * * `/pages/blog/[id].jsx` matches `/blog/123`
 * * `/pages/[...catchAll].jsx` matches any URL not explicitly matched
 *
 * @param {object} pages value of import.meta.globEager(). See https://vitejs.dev/guide/features.html#glob-import
 *
 * @return {Routes} `<Routes/>` from React Router, with a `<Route/>` for each file in `pages`
 */
export const Routes = ({ pages }: RoutesProps) => {
  const routes = useRoutes(pages);
  const routeComponents = routes.map(({ path, component: Component }) => (
    <Route key={path} path={path} element={<Component />} />
  ));

  const NotFound = routes.find(
    ({ path }) => path === UI_ROUTES.NOT_FOUND
  )?.component;

  return (
    <ReactRouterRoutes>
      {routeComponents}
      <Route path="*" element={NotFound && <NotFound />} />
    </ReactRouterRoutes>
  );
};
