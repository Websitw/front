import React, { useEffect } from "react";
import { useOrder } from "../../../hooks/useOrder";
import OrderCard from "../OrderCard/OrderCard";
import LoadingSpinner from "../../../components/common/LoadingSpinner/LoadingSpinner";

const HistoryOrder = () => {
  const { getOrders, orders, loading } = useOrder();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (userId) {
      getOrders({
        enrich: true,
        q: `properties.userId:${userId}`,
      });
    }
  }, [userId]);

  const filteredOrders = orders?.filter((order) => order.status !== "CREATED");
  return (
    <div className="currentOrderWrapper">
      <h2 className="pageTitle">Orders History ({filteredOrders?.length})</h2>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {filteredOrders?.map((order) => (
            <OrderCard key={order?.id} order={order} />
          ))}
        </>
      )}
    </div>
  );
};

export default HistoryOrder;
