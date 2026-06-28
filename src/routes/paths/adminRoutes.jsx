import { lazy } from 'react';
import Loadable from '../Loadable';
import AuthGuard from '../AuthGuard';

const Dashboard = Loadable(lazy(() => import('../../components/Admin/Dashboard/Dashboard')));
const DashboardHome = Loadable(lazy(() => import('../../components/Admin/Dashboard/DashboardHome')));
const Users = Loadable(lazy(() => import('../../pages/Users/Users')));
const PlatformSetting = Loadable(lazy(() => import('../../pages/PlatformSetting/PlatformSetting')));
const CMS = Loadable(lazy(() => import('../../pages/CMS/CMS')));
const SegmentsMangement = Loadable(lazy(() => import('../../pages/SegmentsMangement/SegmentsMangement')));
const CategoriesManagement = Loadable(lazy(() => import('../../pages/CategoriesManagement/CategoriesManagement')));
const BrandManagement = Loadable(lazy(() => import('../../pages/BrandManagement/BrandManagement')));
const BrandStorefrontManagement = Loadable(lazy(() => import('../../pages/BrandStorefrontManagement/BrandStorefrontManagement')));
const OnboardingDocuments = Loadable(lazy(() => import('../../pages/OnboardingDocuments/OnboardingDocuments')));
const ManageAgreements = Loadable(lazy(() => import('../../pages/ManageAgreements/ManageAgreements')));
const GlobalAttributes = Loadable(lazy(() => import('../../pages/GlobalAttributes/GlobalAttributes')));
const Merchants = Loadable(lazy(() => import('../../pages/Merchants/Merchants')));


const adminRoutes = {
  path: 'dashboard',
  element: <AuthGuard allowedRoles={['superadmin', 'admin']} />,
  children: [
    {
      path: '',
      element: <Dashboard />,
      children: [
        {
          index: true,
          element: <DashboardHome />
        },
        {
          path: 'users',
          element: <Users />
        },
        {
          path:"PlatformSetting",
          element : <PlatformSetting/>
        },
        {
          path:'SegmentsMangement',
          element: <SegmentsMangement/>

        },
        {
          path:'CategoriesManagement',
          element: <CategoriesManagement/>
        },
        {
          
            path:'BrandManagement',
            element: <BrandManagement/>
          
        },
        {
          path: 'BrandManagement/:brandId/storefront',
          element: <BrandStorefrontManagement/>
        },
        {
          path:'OnboardingDocuments',
          element :<OnboardingDocuments/>

        },
        {
          path:'ManageAgreements',
          element:<ManageAgreements/>

        },
        {
          path:'GlobalAttributes',
          element: <GlobalAttributes/>
        },
        {
          path:'Merchants',
          element : <Merchants/>

        },
        {
          path:"CMS",
          element:<CMS/>
        }
      ]
    }
  ]
};

export default adminRoutes;
