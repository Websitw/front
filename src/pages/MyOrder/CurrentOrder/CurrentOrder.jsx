import React, { useEffect } from "react";
import { useOrder } from "../../../hooks/useOrder";
import OrderCard from "../OrderCard/OrderCard";
import LoadingSpinner from "../../../components/common/LoadingSpinner/LoadingSpinner";

const CurrentOrder = () => {
  const userId = localStorage.getItem("userId");
  const { getOrders, orders, loading } = useOrder();

  useEffect(() => {
    if (userId) {
      getOrders({
        enrich: true,
        q: `properties.userId:${userId} AND properties.status:(CREATED)`,
      });
    }
  }, [userId]);

  console.log("Current Orders:", orders);
  return (
    <div className="currentOrderWrapper">
      <h2 className="pageTitle">In Progress Orders ({orders?.length})</h2>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {orders?.map((order) => (
            <OrderCard key={order?.id} order={order} />
          ))}
        </>
      )}
    </div>
  );
};

export default CurrentOrder;
