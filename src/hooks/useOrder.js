import {
  fetchUserOrders,
  createUserOrder,
  deleteUserOrder,
  getUserOrder,
} from "../store/slices/ordersSlice";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { showToast } from "../components/CustomToast/CustomToast";

export const useOrder = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const {items: orders, item: order} = useSelector((state) => state.orders);
  const getOrders = (params) => {
    setLoading(true);
    return dispatch(fetchUserOrders(params))
      .unwrap()
      .then((result) => {
        return { success: true, data: result };
      })
      .catch((error) => {
        showToast.error(error?.message || "Failed to fetch orders");
        console.error("Error fetching orders:", error);
        return { success: false, error };
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getOrder = (orderId) => {
    setLoading(true);
    return dispatch(getUserOrder(orderId))
      .unwrap()
      .then((result) => {
        return { success: true, data: result };
      })
      .catch((error) => {
        showToast.error(error?.message || "Failed to fetch order");
        console.error("Error fetching order:", error);
        return { success: false, error };
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const addOrder = () => {
    setLoading(true);
    const orderPayload = {
      checkoutId: localStorage.getItem("checkoutId"),
    }
    return dispatch(createUserOrder(orderPayload))
      .unwrap()
      .then((result) => {
        showToast.success("Order placed successfully");
        localStorage.removeItem("checkoutId");
        localStorage.removeItem("cartId");
        localStorage.removeItem("sessionId")
        return { success: true, data: result };
      })
      .catch((error) => {
        showToast.error(error?.message || "Failed to place order");
        console.error("Error placing order:", error);
        return { success: false, error };
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const removeOrder = (orderId) => {
    setLoading(true);
    return dispatch(deleteUserOrder(orderId))
      .unwrap()
      .then(() => {
        return { success: true };
      })
      .catch((error) => {
        showToast.error(error?.message || "Failed to cancel order");
        console.error("Error cancelling order:", error);
        return { success: false, error };
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return {
    getOrders,
    getOrder,
    addOrder,
    removeOrder,
    loading,
    orders,
    order
  };
};