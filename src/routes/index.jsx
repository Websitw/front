import { lazy } from 'react';
import publicRoutes from './paths/publicRoutes';
import adminRoutes from './paths/adminRoutes';
import merchantRoutes from './paths/merchantRoutes';
import userRoutes from './paths/userRoutes';
import companyRoutes from './paths/companyRoutes';
import RedirectBasedOnRole from './RedirectBasedOnRole';
import Loadable from './Loadable';

const NotFound = Loadable(lazy(() => import('../components/NotFound/NotFound')));

/// Define all routes including public, admin, merchant, user, and company routes
const routes = [
  ...publicRoutes,
  adminRoutes,
  merchantRoutes,
  userRoutes,
  companyRoutes,
  {
    path: '/404',
    element: <NotFound />
  },
  {
    path: '*',
    element: <RedirectBasedOnRole />
  }
];

export default routes;
