import { lazy } from 'react';
import Loadable from '../Loadable';
import AuthGuard from '../AuthGuard';
import CompanyGuard from '../CompanyGuard';

const UserLayout = Loadable(lazy(() => import('../../layouts/UserLayout')));

const CompanyRequest = Loadable(lazy(() => import('../../components/CompanyRequest/CompanyRequest')));

const companyRoutes = {
  element: <UserLayout />,
  children: [
    {
      element: <AuthGuard allowedRoles={['company']} />,
      children: [
        {
          path: '/CompanyRequest',
          element: <CompanyRequest />
        }
      ]
    },
    {
      element: <AuthGuard allowedRoles={['company']} />,
      children: [
        {
          element: <CompanyGuard />,
          children: [
        
          
         
          ]
        }
      ]
    }
  ]
};

export default companyRoutes;
