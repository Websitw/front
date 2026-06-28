import { lazy } from "react";
import Loadable from "../Loadable";
import AuthGuard from "../AuthGuard";
const HomeDashboard = Loadable(
  lazy(() => import("../../components/MerchantDashboard/HomeDashboard/HomeDashboard")),
);
const MerchantDashboard = Loadable(
  lazy(() => import("../../components/MerchantDashboard/MerchantDashboard")),
);
const Categories = Loadable(
  lazy(
    () => import("../../components/MerchantDashboard/Categories/Categories"),
  ),
);
const Products = Loadable(lazy(() => import("../../pages/Products/Products")));

const CompleteProfile = Loadable(
  lazy(
    () =>
      import("../../components/MerchantDashboard/CompleteProfile/CompleteProfile"),
  ),
);
const MerchantHome = Loadable(lazy(() => import("../../pages/MerchantHome/MerchantHome")));
const BrandManagement = Loadable(lazy(() => import("../../pages/BrandManagement/BrandManagement")));
const BrandStorefrontManagement = Loadable(
  lazy(() => import("../../pages/BrandStorefrontManagement/BrandStorefrontManagement")),
);
const AddNewProduct = Loadable(lazy(() => import("../../components/MerchantDashboard/AddNewProduct/AddNewProduct")));

const merchantRoutes = {
  path: "merchant",
  element: <AuthGuard allowedRoles={["M", "merchant"]} />,
  children: [
    {
      path: "dashboard",
      element: <MerchantDashboard />,
      children: [
        {
          path: "home",
          element: <MerchantHome />,
        },
        {
          path: "categories",
          element: <Categories />,
        },
        {
          path: "products",
          element: <HomeDashboard />,
        },
        {
          path: "select-inventory",
          element: <Products />,
        },
        {
          path: "complete-profile",
          element: <CompleteProfile />,
        },
        {
          path: "add-product",
          element: <AddNewProduct />,
        },
        {
          
            path:'my-brands',
            element: <BrandManagement/>
          
        },
        {
          path: "my-brands/:brandId/storefront",
          element: <BrandStorefrontManagement />,
        },
      ],
    },
  ],
};

export default merchantRoutes;
