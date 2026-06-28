import { lazy } from "react";
import Loadable from "../Loadable";
import GuestGuard from "../GuestGuard";
import AuthGuard from "../AuthGuard";

const UserLayout = Loadable(lazy(() => import("../../layouts/UserLayout")));
const BrandMarketLayout = Loadable(
  lazy(() => import("../../layouts/BrandMarketLayout")),
);
// import Wishlist from '../../pages/Wishlist/Wishlist'
const AnimatedStoreLayout = Loadable(
  lazy(() => import("../../components/AnimatedStoreLayout/AnimatedStoreLayout")),
);
const HomeWrapper = Loadable(lazy(() => import("../../pages/HomeWrapper/HomeWrapper")));
const BrandStore = Loadable(lazy(() => import("../../pages/BrandStore/BrandStore")));
const UserBusinessAccount = Loadable(
  lazy(() => import("../../pages/UserBusinessAccount/UserBusinessAccount")),
);
const AccountSettings = Loadable(lazy(() => import("../../pages/AccountHome/AccountHome")));
const Cart = Loadable(lazy(() => import("../../pages/Cart/Cart")));
const MyOrder = Loadable(lazy(() => import("../../pages/MyOrder/MyOrder")));
const OrderDetails = Loadable(
  lazy(() => import("../../pages/MyOrder/OrderDetails/OrderDetails")),
);
const SegmentCategories = Loadable(
  lazy(() => import("../../pages/SegmentCategories/SegmentCategories")),
);
const FavoriteStores = Loadable(
  lazy(() => import("../../pages/FavoriteStores/FavoriteStores")),
);
const Rewards = Loadable(lazy(() => import("../../pages/Rewards/Rewards")));
const BrandTemplate = Loadable(lazy(() => import("../../pages/BrandTemplate/BrandTemplate")));
const BusinessAccountTabs = Loadable(
  lazy(() => import("../../pages/BusinessAccountTabs/BusinessAccountTabs")),
);
const Wishlist = Loadable(lazy(() => import("../../pages/Wishlist/Wishlist")));
const SearchPage = Loadable(lazy(() => import("../../pages/Search/Search")));
const SearchBrandPage = Loadable(
  lazy(() => import("../../pages/SearchBrand/SearchBrand")),
);

const SearchCategoryBrandPage = Loadable(
  lazy(() => import("../../pages/SearchCategoryBrand/SearchCategoryBrand")),
);

const userRoutes = {
  children: [
    {
      element: <UserLayout />,
      children: [
        {
          element: <GuestGuard />,
          children: [
            {
              element: <AnimatedStoreLayout />,
              children: [
                {
                  path: "/",
                  element: <HomeWrapper />,
                },
                {
                  path: "brand-stores",
                  element: <BrandStore />,
                },
              ],
            },
            {
              path: "/search-category-brand",
              element: <SearchCategoryBrandPage />,
            },
            {
              path: "/search",
              element: <SearchPage />,
            },
            {
              path: "/search-brand",
              element: <SearchBrandPage />,
            },
            {
              path: "/cart",
              element: <Cart />,
            },
            {
              path: "/MyOrder",
              element: <MyOrder />,
            },
            {
              path: "/order-details",
              element: <OrderDetails />,
            },
            {
              path: "Wishlist",
              element: <Wishlist />,
            },
            {
              path: "/SegmentCategories",
              element: <SegmentCategories />,
            },
          ],
        },
        {
          element: <AuthGuard allowedRoles={["U", "company", "customer"]} />,
          children: [
            {
              path: "/business-account",
              element: <UserBusinessAccount />,
            },
            {
              path: "/account-settings",
              element: <AccountSettings />,
            },
            {
              path: "/business-account-settings",
              element: <BusinessAccountTabs />,
            },
            // {
            //   path:'/MyOrder',
            //   element : <MyOrder/>
            // }

            {
              path: "/Wishlist",
              element: <Wishlist />,
            },
            {
              path: "/my-favorite-stores",
              element: <FavoriteStores />,
            },
            {
              path: "/rewards",
              element: <Rewards />,
            },
          ],
        },
      ],
    },
    {
      element: <BrandMarketLayout />,
      children: [
        {
          element: <GuestGuard />,
          children: [
            {
              path: "/BrandTemplate",
              element: <BrandTemplate />,
            },
            {
              path: "/brands/:brandRef",
              element: <BrandTemplate />,
            },
          ],
        },
      ],
    },
  ],
};

export default userRoutes;
