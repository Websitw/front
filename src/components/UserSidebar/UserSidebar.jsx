import React, { lazy, useCallback, useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { selectIsAuthenticated } from "../../store/slices/authSlice";
import { fetchCountriesListAnonymous } from "../../store/slices/counteriesSlice";
import { userCompanyStatus } from "../../store/slices/usersSlice";
import { selectUser } from "../../store/slices/authSlice";
import {
  setSearchOpen,
  setSidebarOpen,
  setBrandFilterOpen,
  setSearchCategoryBrandOpen,
} from "../../store/slices/userSidebar";
import Loadable from "../../routes/Loadable";
import SidebarNav from "./SidebarNav";
import "./UserSidebar.css";
import useSideBar from "../../hooks/useSidebar";
import { isBrandMarketPath } from "../../helper/brandRoutes";

import imageDarkMode1 from '../../assets/icons/homeDarkMode.png'

import imageDarkMode2 from '../../assets/icons/darkMode_1.png'


import imageDarkMode4 from '../../assets/icons/heartDarkMode.png'
import HomeDarkMode from '../../assets/icons/iconDarkMode.png'
import heartIcon from "../../assets/userSidebar/heart.svg";
import shoppingIcon from "../../assets/userSidebar/shopping-bag.svg";
import homeIcon from "../../assets/userSidebar/Homeicon (1).svg";
import storefrontIcon from "../../assets/userSidebar/storefront-outline.svg";

const BrandTooltip = Loadable(lazy(() => import("./BrandTooltip/BrandTooltip")));
const SearchModal = Loadable(lazy(() => import("./SearchModal/SearchModal")));
const LoginModal = Loadable(lazy(() => import("./LoginModal")));
const AccountModal = Loadable(lazy(() => import("./AccountModal")));
const RegisterModal = Loadable(lazy(() => import("./RegisterModal")));
const VerifyModal = Loadable(lazy(() => import("./VerifyModal")));
const SuccessModal = Loadable(lazy(() => import("./SuccessModal")));
const ForgotPasswordModal = Loadable(lazy(() => import("./ForgotPasswordModal")));
const CartDrawer = Loadable(lazy(() => import("./CartDrawer")));

const UserSidebar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { setLoginOpen, loginOpen, cartOpen, setCartOpen } = useSideBar();
  const pathname = location.pathname;
  const isIncludedBrand = pathname.includes("brand");


  

  const isBrandMarket = isBrandMarketPath(pathname);

  const isLoggedIn = useSelector(selectIsAuthenticated);
  const userCheck = useSelector(selectUser);

  const {
    searchOpen,
    sidebarOpen,
    brandFilterOpen,
    searchCategoryBrandOpen,
  } = useSelector((state) => state.userSidebar);

  const [registerOpen, setRegisterOpen] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  const [pendingLoginData, setPendingLoginData] = useState(null);

  useEffect(() => {
    dispatch(fetchCountriesListAnonymous());
  }, [dispatch]);

  useEffect(() => {
    if (userCheck?.id) {
      dispatch(userCompanyStatus(userCheck.id));
    }
  }, [userCheck, dispatch]);

  useEffect(() => {
    if (searchOpen && pathname.includes("search")) {
      dispatch(setSearchOpen(false));
    }
  }, [searchOpen, pathname, dispatch]);

  const closeActionPanels = useCallback(() => {
    dispatch(setSearchOpen(false));
    dispatch(setSidebarOpen(false));
    dispatch(setBrandFilterOpen(false));
    dispatch(setSearchCategoryBrandOpen(false));
    setLoginOpen(false);
    setCartOpen(false);
    setRegisterOpen(false);
    setVerifyOpen(false);
    setSuccessOpen(false);
    setForgotPasswordOpen(false);
    setPendingLoginData(null);
  }, [dispatch, setCartOpen, setLoginOpen]);

  const hasOpenActionPanel =
    searchOpen ||
    sidebarOpen ||
    brandFilterOpen ||
    searchCategoryBrandOpen ||
    loginOpen ||
    cartOpen ||
    registerOpen ||
    verifyOpen ||
    successOpen ||
    forgotPasswordOpen;

  useEffect(() => {
    if (!hasOpenActionPanel) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeActionPanels();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeActionPanels, hasOpenActionPanel]);

  const handleOpenSearch = () => {
    closeActionPanels();

    if (pathname === "/search") {
      dispatch(setSidebarOpen(true));
    } else if (pathname === "/search-brand") {
      dispatch(setBrandFilterOpen(true));
    } else if (pathname === "/search-category-brand") {
      dispatch(setSearchCategoryBrandOpen(true));
    } else {
      dispatch(setSearchOpen(true));
    }
  };

  const handleOpenCart = () => {
    closeActionPanels();
    setCartOpen(true);
  };

  const handleOpenAccount = () => {
    closeActionPanels();
    setLoginOpen(true);
  };

  const handleOpenWishlist = () => {
    closeActionPanels();

    if (isLoggedIn) {
      navigate("/Wishlist");
      return;
    }

    setLoginOpen(true);
  };

  const handleVerifyBack = () => {
    setVerifyOpen(false);
    if (pendingLoginData) {
      setLoginOpen(true);
      setPendingLoginData(null);
    } else {
      setRegisterOpen(true);
    }
  };

  const MENU_ITEMS = useMemo(() => [
    {
      icon: homeIcon,
      title: "Personal Account ",
      subtitle: "Profile overview",
      route: "/account-settings",
      darkMode:HomeDarkMode
    },
    {
      icon: shoppingIcon,
      title: "My Orders",
      subtitle: "Current orders & history",
      route: "/MyOrder",
          darkMode:imageDarkMode1
    },
    // {
    //   icon: giftIcon,
    //   title: "My Reviews & Ratings",
    //   subtitle: "Feedback",
    //   route: null,
    // },
    {
      icon: heartIcon,
      title: "My Wishlist",
      subtitle: "Favorite & saved products",
      route: '/Wishlist',
      darkMode:imageDarkMode4
    },
    {
      icon: storefrontIcon,
      title: "My Favorite Store",
      subtitle: "Favorite Brands",
      route: "/my-favorite-stores",
      darkMode:imageDarkMode2
    },

  ], []);

  const otherRoutes = useMemo(
    () => [...MENU_ITEMS.map((item) => item.route), "/order-details"],
    [MENU_ITEMS],
  );

  useEffect(()=>{
    if(isLoggedIn && otherRoutes.includes(pathname)){
      dispatch(setLoginOpen(true))
    }
  },[dispatch, isLoggedIn, otherRoutes, pathname, setLoginOpen])
  

  return (
    <>

      {!isBrandMarket && <BrandTooltip variant="desktop" />}

      <div className="user-sidebar-root">
        {hasOpenActionPanel && (
          <div
            className="user-sidebar-backdrop"
            aria-hidden="true"
            onClick={closeActionPanels}
          />
        )}

        <SidebarNav
          onOpenSearch={handleOpenSearch}
          onOpenCart={handleOpenCart}
          onOpenAccount={handleOpenAccount}
          onOpenWishlist={handleOpenWishlist}
          showBrandSwitch={!isBrandMarket}
          brandTriggerRoute={isBrandMarket ? "/brand-stores" : "/"}
        />

        {isLoggedIn && loginOpen ? (
          <AccountModal
            isOpen={loginOpen}
            onClose={() => setLoginOpen(false)}
            isIncludedBrand={isIncludedBrand}
            MENU_ITEMS={MENU_ITEMS}
          />
        ) : null}

        {!isLoggedIn && loginOpen ? (
          <LoginModal
            isOpen={loginOpen}
            onClose={() => setLoginOpen(false)}
            onOpenRegister={() => setRegisterOpen(true)}
            onOpenForgotPassword={() => setForgotPasswordOpen(true)}
            onOpenVerify={() => setVerifyOpen(true)}
            setPendingLoginData={setPendingLoginData}
            isIncludedBrand={isIncludedBrand}
          />
        ) : null}

        {registerOpen ? (
          <RegisterModal
            isOpen={registerOpen}
            onClose={() => setRegisterOpen(false)}
            onOpenVerify={() => setVerifyOpen(true)}
          />
        ) : null}

        {verifyOpen ? (
          <VerifyModal
            isOpen={verifyOpen}
            onClose={() => setVerifyOpen(false)}
            onSuccess={() => setSuccessOpen(true)}
            onBack={handleVerifyBack}
            pendingLoginData={pendingLoginData}
            setPendingLoginData={setPendingLoginData}
          />
        ) : null}

        {successOpen ? (
          <SuccessModal
            isOpen={successOpen}
            onClose={() => setSuccessOpen(false)}
          />
        ) : null}

        {forgotPasswordOpen ? (
          <ForgotPasswordModal
            isOpen={forgotPasswordOpen}
            onClose={() => setForgotPasswordOpen(false)}
            onBackToLogin={() => setLoginOpen(true)}
          />
        ) : null}

        {cartOpen ? (
          <CartDrawer
            handleOpenSearch={handleOpenSearch}
            isOpen={cartOpen}
            onClose={() => setCartOpen(false)}
            isIncludedBrand={isIncludedBrand}
          />
        ) : null}

        {searchOpen ? <SearchModal isBrandStore={isIncludedBrand} /> : null}
      </div>
    </>
  );
};

export default UserSidebar;
