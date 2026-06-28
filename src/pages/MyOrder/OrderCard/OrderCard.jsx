import React from "react";
import PrintIcon from "@mui/icons-material/Print";
import { useNavigate } from "react-router-dom";
import { formatDate, imageUrl } from "../../../helper/helper";
import { ImageNotFound } from "../../../assets/icons";

const getSkuTitles = (order) => {
  const titles = [];
  order?.subOrders?.forEach((subOrder) => {
    subOrder?.orderLines?.forEach((line) => {
      titles.push(line?.sku?.productTitle_i18n?.en);
    });
  });
  return titles;
};

const getImageId = (order) => {
  return order?.subOrders?.[0]?.orderLines?.[0]?.sku?.mediaList?.[0]?.mediaId;
};

const OrderCard = ({ order }) => {
  const navigate = useNavigate();
  const titles = getSkuTitles(order);
  const mediaId = getImageId(order);

  return (
    <div className="orderCard">
      <div className="orderHeader">
        <div className="orderStatus">
          <span className="statusBadge">
            <span className="statusDot" />
            {order?.status}
          </span>
          <span className="orderDate">
            {formatDate(order?.createdAt, true)}
          </span>
        </div>

        <div className="printInvoices">
          <PrintIcon fontSize="small" />
          <span>Print Invoices</span>
        </div>
      </div>

      <div className="orderBody">
        <div className="productInfo">
          <div className="productImage">
            <img
              src={mediaId ? `${imageUrl}${mediaId}` : ImageNotFound}
              alt="product"
            />
          </div>

          <div className="productDetails">
            <h4>Order : {order?.orderCode}</h4>
            <p className="productName">
              {titles?.slice(0, 1).join(" / ")}
              {titles?.length > 1 && (
                <span className="itemsLink">
                  {" "}& {titles.length - 1} Item
                </span>
              )}
            </p>
            <p className="price">
              {order?.currencyCode} {order?.totalPriceIncTax}
            </p>
          </div>
        </div>

        <button
          className="detailsBtn"
          onClick={() => navigate(`/order-details?orderId=${order?.id}`)}
        >
          Details
        </button>
      </div>
    </div>
  );
};

export default OrderCard;