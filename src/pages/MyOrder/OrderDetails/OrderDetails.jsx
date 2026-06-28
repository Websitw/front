import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./OrderDetails.css";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import markIcon from "../../../assets/icons/markIcon.svg";
import { formatDateTwo, imageUrl } from "../../../helper/helper";
import { useOrder } from "../../../hooks/useOrder";
import useCart from "../../../hooks/useCart";
import useSearch from "../../../hooks/useSearch";
import ReviewModal from "./ReviewModal/ReviewModal";

const OrderDetails = () => {
  const navigation = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { getOrder, order, removeOrder, loading } = useOrder();
  const { addNewItemToCart } = useCart();
  const { reviewProductHandler } = useSearch();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (orderId) {
      getOrder(`${orderId}?enrich=true`);
    }
  }, [orderId]);

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showCancelReason, setShowCancelReason] = useState(false);
  const [showCancelSuccess, setShowCancelSuccess] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [reviewItem, setReviewItem] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");

  const address = order?.subOrders?.[0]?.shippingAddress;
  const currency = order?.currencyCode;

  const getStepStatus = (status) => {
    switch (status) {
      case "CREATED":
        return 1;
      case "SHIPPED":
        return 2;
      case "DELIVERED":
        return 3;
      default:
        return 1;
    }
  };

  const currentStep = getStepStatus(order?.status);

  const handleCancelOrder = async () => {

      setShowCancelConfirm(false);
      setShowCancelReason(true);
    
  };

  const handleOpenReview = useCallback((item) => {
    setReviewItem(item);
    setShowReviewModal(true);
  }, []);

  const handleCloseReview = useCallback(() => {
    setShowReviewModal(false);
    setReviewItem(null);
  }, []);

  const orderstatus = order?.status;

  const handleReasonCancelOrder = async () => {
    const result = await removeOrder(orderId);
    if (result.success) {
      getOrder(`${orderId}?enrich=true`);
      setShowCancelReason(false);
      setShowCancelSuccess(true);
    }
  };
  return (
    <>
      <div className="order-detalis-screen">
        <div className="my-order-container">
          <div className="orderDetailsWrapper">
            <h1 className="account-title">My Orders</h1>

            <div
              onClick={() => {
                navigation("/MyOrder");
              }}
              className="backLink"
            >
              <ArrowBackIcon fontSize="small" />
              Back
            </div>

            <h3 className="orderNumber">
              Current Orders | <span>Order : #{order?.orderCode}</span>
            </h3>

            <div className="sectionTitle">
              Items Ordered & Delivery Details
              <span
                className="cancelOrder"
                onClick={() => setShowCancelConfirm(true)}
              >
                Cancel Order
              </span>
            </div>

            {orderstatus === "CANCELLED" && (
              <div className="order-status-cancel-container">
                <h2 className="order-title">This Order Has Been Cancelled</h2>
                <p className="order-date">
                  Time placed: {new Date(order?.createdAt).toLocaleString()}
                </p>
              </div>
            )}

            <div className="shippingCard">
              <div>
                <h4>Shipping Address</h4>

                <p className="addressMain">
                  {address?.countryName} - {address?.cityName}
                </p>

                <p className="addressSub">
                  {address?.address1}, {address?.address2}
                </p>

                <p className="phone">
                  <strong>Phone</strong>: {address?.phoneNumber}
                </p>
              </div>

              <div
                className="invoiceDetails"
                onClick={() => setShowInvoice(true)}
              >
                <DescriptionOutlinedIcon fontSize="small" />
                Invoices Details
              </div>
            </div>

            <div className="order-view">
              <div className="orderSummaryHeader">
                <div>
                  <p>
                    Time placed: {new Date(order?.createdAt).toLocaleString()}
                  </p>
                  <strong>Order : #{order?.orderCode}</strong>
                </div>

                <div className="summaryRight">
                  <p>Total Item : ({order?.itemCount}) Item</p>
                  <strong>
                    Total Price : {currency} {order?.totalPriceIncTax}
                  </strong>
                </div>
              </div>

              {order?.subOrders?.map((subOrder, subIndex) => (
                <div key={subOrder.id || subIndex}>
                  <h3 className="deliveryTitle">
                    Delivered Between {formatDateTwo(subOrder.etaStart)} -{" "}
                    {formatDateTwo(subOrder.etaEnd)}
                  </h3>

                  <p className="deliveryStatus">
                    Status:{" "}
                    <span
                      style={{
                        color:
                          subOrder.status === "DELIVERED"
                            ? "#28913F"
                            : subOrder.status === "SHIPPED"
                              ? "#5092E8"
                              : "#F0A500",
                        fontWeight: "600",
                      }}
                    >
                      {subOrder.status}
                    </span>
                  </p>

                  {subOrder.orderLines?.map((item, lineIndex) => (
                    <div
                      className="productRow"
                      key={`${subOrder.id}-${item.skuId}-${lineIndex}`}
                    >
                      <div className="productLeft">
                        <img
                          className="productImage"
                          src={
                            item.sku?.mediaList?.[0]?.mediaId
                              ? `${imageUrl}${item.sku.mediaList[0].mediaId}`
                              : "https://via.placeholder.com/100"
                          }
                          alt={item.sku?.productTitle || "Product"}
                        />

                        <div>
                          <h4>{item.sku?.productTitle}</h4>

                          <div className="tags">
                            {item.sku?.brandName && (
                              <span>{item.sku.brandName}</span>
                            )}
                            {item.sku?.categoryName && (
                              <span>{item.sku.categoryName}</span>
                            )}
                          </div>

                          {item.sku?.attributeValues?.length > 0 && (
                            <div className="tags">
                              {item.sku.attributeValues.map((attr, i) => (
                                <span key={i}>
                                  {attr.label}: {attr.value}
                                </span>
                              ))}
                            </div>
                          )}

                          {item.isGift && (
                            <p style={{ marginTop: 8 }}>
                              Gift{" "}
                              <span style={{ color: "#5092E8" }}>
                                View Details
                              </span>
                            </p>
                          )}

                          <p className="qty">Quantity : {item.quantity}x</p>

                          <strong>
                            {currency}{" "}
                            {item.sku?.price.JO?.salePrice
                              ? item.sku.price.JO.salePrice
                              : item.sku.price.JO.listPrice}
                            {item.sku?.price.JO?.salePrice && (
                              <span
                                style={{
                                  textDecoration: "line-through",
                                  color: "#999",
                                  marginLeft: 8,
                                  fontWeight: 400,
                                }}
                              >
                                {currency} {item.sku.price.JO.listPrice}
                              </span>
                            )}
                          </strong>
                        </div>
                      </div>

                      <div className="productActions">
                        <div className="timeline">
                          <div
                            className={`timelineStep ${currentStep >= 1 ? "active" : ""}`}
                          >
                            <div className="circle">
                              <DescriptionOutlinedIcon fontSize="small" />
                            </div>
                          </div>

                          <div className="line" />

                          <div
                            className={`timelineStep ${currentStep >= 2 ? "active" : ""}`}
                          >
                            <div className="circle">
                              <LocalShippingOutlinedIcon fontSize="small" />
                            </div>
                          </div>

                          <div className="line" />

                          <div
                            className={`timelineStep ${currentStep >= 3 ? "active" : ""}`}
                          >
                            <div className="circle">
                              <CheckCircleOutlineIcon fontSize="small" />
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => addNewItemToCart(item?.sku)}
                          className="btnPrimary"
                        >
                          Reorder
                        </button>
                        <button
                          onClick={() => handleOpenReview(item)}
                          className="btnPrimary"
                        >
                          Write a Review
                        </button>
                        <button className="btnDisabled">Return</button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {showCancelConfirm && (
          <div className="modalBox">
            <button
              className="closeBtn"
              onClick={() => setShowCancelConfirm(false)}
            >
              ✕
            </button>

            <div className="warningIcon">⚠</div>

            <h2>Cancel order!</h2>
            <p>Are you sure you want to delete the Order ?</p>

            <h3>#{order?.orderCode}</h3>

            <div className="noteBox">
              <span>Note :</span> Your entire order will be cancelled. To keep
              shopping together, please review your items before proceeding.
            </div>

            <div className="modalActions">
              <button
                className="dangerBtn"
                disabled={loading}
                onClick={handleCancelOrder}
              >
                {loading ? "Cancelling..." : "Yes, Cancel & Refund"}
              </button>

              <button
                className="secondaryBtn"
                onClick={() => setShowCancelConfirm(false)}
              >
                Cancel, keep It
              </button>
            </div>
          </div>
        )}

        {showCancelReason && (
          <div className="modalBox">
            <button
              className="closeBtn"
              onClick={() => setShowCancelReason(false)}
            >
              ✕
            </button>

            <h2 className="Cancel-and-Refund">Cancel & Refund</h2>
            <p className="Cancel-and-Refund-text">
              We're sorry to see you cancel your order! Could you tell us why?
            </p>

            <div className="reasonList">
              {[
                "Order Created by Mistake",
                "Delivery Time is Too Long",
                "Found a Better Price Elsewhere",
                "Shipping Cost is Too High",
                "Need to Change Shipping Address",
                "Other Reason",
              ].map((reason) => (
                <label key={reason}>
                  <input
                    type="checkbox"
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                  />
                  {reason}
                </label>
              ))}
            </div>

            <button
              className="primaryBlackBtn"
              disabled={!selectedReason}
              onClick={handleReasonCancelOrder}
            >
              Continuing The Cancellation Process
            </button>

            <button
              className="secondaryBtn full"
              onClick={() => setShowCancelReason(false)}
            >
              Cancel
            </button>
          </div>
        )}

        {showCancelSuccess && (
          <div className="modalBox center">
            <button
              className="closeBtn"
              onClick={() => setShowCancelSuccess(false)}
            >
              ✕
            </button>

            <div className="successIcon">
              <img src={markIcon} />
            </div>

            <h1
              style={{
                textAlign: "center",
                fontWeight: "600",
                color: "#121212",
                fontSize: "22px",
              }}
            >
              Order cancelled
            </h1>
            <p
              style={{
                fontWeight: "300",
                color: "#000",
                fontSize: "16px",
              }}
            >
              Order Cancelled successfully.
            </p>

            <div className="noteBox">
              <span>Note :</span> Refund takes 2–5 business days.
            </div>

            <button
              className="primaryBlackBtn"
              onClick={() => {
                setShowCancelSuccess(false);
                // navigation("/MyOrder");
              }}
            >
              Done
            </button>
          </div>
        )}

        {/* {showInvoice && (
          <div className="modalBox">
            <button className="closeBtn" onClick={() => setShowInvoice(false)}>
              ✕
            </button>

            <h2>Invoices Details</h2>

            <div className="invoiceRow">
              <span>Subtotal</span>
              <strong>
                {currency} {order?.subtotalPrice}
              </strong>
            </div>

            <div className="invoiceRow">
              <span>Shipping</span>
              <strong>
                {currency} {order?.shippingAmount}
              </strong>
            </div>

            {order?.couponDiscountAmount > 0 && (
              <div className="invoiceRow discount">
                <span>Coupon Discount</span>
                <strong>
                  -{currency} {order?.couponDiscountAmount}
                </strong>
              </div>
            )}

            <div className="invoiceRow discount">
              <span>Discount</span>
              <strong>
                -{currency} {order?.discountAmount}
              </strong>
            </div>

            {order?.taxAmount > 0 && (
              <div className="invoiceRow">
                <span>Tax</span>
                <strong>
                  {currency} {order?.taxAmount}
                </strong>
              </div>
            )}

            {order?.giftFee > 0 && (
              <div className="invoiceRow">
                <span>Gift Fee</span>
                <strong>
                  {currency} {order?.giftFee}
                </strong>
              </div>
            )}

            <hr />

            <div className="invoiceRow total">
              <span>Total Payment</span>
              <strong>
                {currency} {order?.totalPriceIncTax}
              </strong>
            </div>

            <button className="primaryBlackBtn">Download Invoices</button>

            <button
              className="secondaryBtn full"
              onClick={() => setShowInvoice(false)}
            >
              Cancel
            </button>
          </div>
        )} */}

        {showReviewModal && reviewItem && (
          <ReviewModal
            item={reviewItem}
            currency={currency}
            userId={userId}
            onClose={handleCloseReview}
            reviewProductHandler={reviewProductHandler}
          />
        )}
      </div>
    </>
  );
};

export default OrderDetails;
