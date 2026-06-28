import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setLoginOpen as openLogin,
  setCartOpen as openCart,
} from "../store/slices/userSidebar";

const useSideBar = () => {
  const dispatch = useDispatch();
  const { loginOpen, cartOpen } = useSelector((state) => state.userSidebar);
  const setLoginOpen = useCallback((value) => dispatch(openLogin(value)), [dispatch]);
  const setCartOpen = useCallback((value) => dispatch(openCart(value)), [dispatch]);

  return {
    loginOpen,
    setLoginOpen,
    cartOpen,
    setCartOpen,
  };
};

export default useSideBar;
