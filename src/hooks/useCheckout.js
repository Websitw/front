import {
  createCheckOut,
  getCheckOutDetails,
  patchCheckOut,
} from "../store/slices/checkOutSlice";
import { removeCoupon, getDeliveryFee } from "../store/slices/checkoutDetails";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { showToast } from "../components/CustomToast/CustomToast";

export const useCheckout = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { item } = useSelector((state) => state.checkout);
  const { deliveryFee } = useSelector((state) => state.checkoutDetails);

 

  const getCheckout = () => {
    setLoading(true);
    const checkoutId = localStorage.getItem("checkoutId");
    if (!checkoutId) {
      showToast.error("No checkout found for the current user");
      setLoading(false);
      return Promise.resolve({
        success: false,
        error: "No checkout found for the current user",
      });
    }
    return dispatch(getCheckOutDetails(checkoutId))
      .unwrap()
      .then((result) => {
        console.log("Checkout details fetched:", result);
        return { success: true, data: result };
      })
      .catch((error) => {
        showToast.error(error?.message || "Failed to fetch checkout details");
        console.error("Error fetching checkout:", error);
        return { success: false, error };
      })
      .finally(() => {
        setLoading(false);
      });
  };

   const createCheckout = () => {
    setLoading(true);
    if(!localStorage.getItem("checkoutId")){
    const userId = localStorage.getItem("userId");
    const cartId = localStorage.getItem("cartId");
    if (!userId || !cartId) {
      showToast.error(
        "User must be logged in and have items in the cart to proceed to checkout",
      );
      setLoading(false);
      return Promise.resolve({
        success: false,
        error:
          "User must be logged in and have items in the cart to proceed to checkout",
      });
    }
    return dispatch(
      createCheckOut({
        userId: userId,
        cartId: cartId,
      }),
    )
      .unwrap()
      .then((result) => {
        showToast.success("Checkout created successfully");
        console.log("Checkout created:", result);
        const checkoutId = result.id;
        localStorage.setItem("checkoutId", checkoutId);
        getCheckout();
        return { success: true, data: result };
      })
      .catch((error) => {
        showToast.error(error?.message || "Failed to create checkout");
        console.error("Error creating checkout:", error);
        return { success: false, error };
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      getCheckout();
    }
  };
  const updateCheckout = (checkoutData) => {
    setLoading(true);
    const checkoutId = localStorage.getItem("checkoutId");
    return dispatch(patchCheckOut({ id: checkoutId, data: checkoutData }))
      .unwrap()
      .then((result) => {
        showToast.success("Checkout updated successfully");
        getCheckout();
        return { success: true, data: result };
      })
      .catch((error) => {
        showToast.error(error?.message || "Failed to update checkout");
        console.error("Error updating checkout:", error);
        return { success: false, error };
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const removeCouponFromCheckout = (couponId) => {
    setLoading(true);
    return dispatch(removeCoupon(couponId))
      .unwrap()
      .then((result) => {
        showToast.success("Coupon removed successfully");
        getCheckout()
        return { success: true, data: result };
      })
      .catch((error) => {
        showToast.error(error?.message || "Failed to remove coupon");
        console.error("Error removing coupon:", error);
        return { success: false, error };
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
   const fetchDeliveryFee = (countryId, cityId) => {
    setLoading(true);
    return dispatch(getDeliveryFee({ countryId, cityId }))
      .unwrap()
      .then((result) => {
        // showToast.success("Delivery fee fetched successfully");
        return { success: true, data: result };
      })
      .catch((error) => {
        showToast.error(error?.message || "Failed to fetch delivery fee");
        console.error("Error fetching delivery fee:", error);
        return { success: false, error };
      })
      .finally(() => {
        setLoading(false);
      });
  };
  return {
    createCheckout,
    getCheckout,
    updateCheckout,
    removeCouponFromCheckout,
    fetchDeliveryFee,
    loading,
    checkoutDetails: item,
    deliveryFee

  };
};
