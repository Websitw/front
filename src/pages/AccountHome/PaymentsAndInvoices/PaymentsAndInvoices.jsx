import React from "react";
import { EditIcon } from "../../../assets/icons";
import LoadingSpinner from "../../../components/common/LoadingSpinner/LoadingSpinner";
import usePayment from "../../../hooks/usePayment";

import axios from "axios";
import { useEffect, useState } from "react";
import { environment } from "../../../environments/environment";
import ConfirmDialog from "../../../components/Admin/Modal/Modal";

const PaymentsAndInvoices = () => {
  const [orders, setOrders] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);

  const {
    paymentMethods,
    selectedPaymentMethodId,
    isLoading,
    isAddingCard,
    selectedDateFilter,
    selectPaymentMethod,
    changeDateFilter,
    submitAddCard,
    deleteCard,
    getCardBrand,
    getCardLast4,
    getCardExpMonth,
    getCardExpYear,
    getCardLogoUrl,
  } = usePayment();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${environment.serverOrigin}orders?q=properties.userId:${userId} AND properties.status:(CREATED OR PAID)`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setOrders(res.data.items || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };

    fetchOrders();
  }, []);

  const handleDeleteClick = (paymentMethodId) => {
    setCardToDelete(paymentMethodId);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (cardToDelete) {
      deleteCard(cardToDelete);
    }
    setConfirmOpen(false);
    setCardToDelete(null);
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setCardToDelete(null);
  };

  return (
    <>
      <div className="container-payments-invoices">
        <section className="payment-methods-section">
          <h1 className="section-title">Payment methods</h1>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="cards-grid">
              {paymentMethods.length === 0 && (
                <div
                  className="card payment-card"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "180px",
                  }}
                >
                  <span style={{ color: "#9ca3af", fontSize: "14px" }}>
                    No cards added yet
                  </span>
                </div>
              )}

              {paymentMethods.map((payment) => {
                const brand = getCardBrand(payment);
                const logoUrl = getCardLogoUrl(brand);

                return (
                  <div
                    key={payment.paymentMethodId}
                    className="card payment-card"
                    onClick={() => selectPaymentMethod(payment.paymentMethodId)}
                    style={{
                      cursor: "pointer",
                      border:
                        selectedPaymentMethodId === payment.paymentMethodId
                          ? "2px solid var(--color-primary)"
                          : "2px solid transparent",
                      transition: "border-color 0.2s",
                    }}
                  >
                    <div className="radio-button">
                      <div
                        className="radio-outer"
                        style={{
                          borderColor:
                            selectedPaymentMethodId === payment.paymentMethodId
                              ? "var(--color-primary)"
                              : undefined,
                        }}
                      >
                        <div
                          className="radio-inner"
                          style={{
                            backgroundColor:
                              selectedPaymentMethodId ===
                              payment.paymentMethodId
                                ? "var(--color-primary)"
                                : "transparent",
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="visa-logo">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt={brand.toUpperCase()}
                          style={{
                            width: "64px",
                            height: "auto",
                            objectFit: "contain",
                          }}
                        />
                      ) : (
                        brand.toUpperCase()
                      )}
                    </div>

                    <div className="card-number">
                      {brand} ••••{getCardLast4(payment)} |{" "}
                      {getCardExpMonth(payment)}/{getCardExpYear(payment)}
                    </div>
                    <span
                      className="remove-card-payment"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(payment.paymentMethodId);
                      }}
                    >
                      Remove Card
                    </span>
                  </div>
                );
              })}

              <div className="card add-payment-card">
                <button
                  className="add-payment-btn"
                  onClick={submitAddCard}
                  disabled={isAddingCard}
                  style={{ opacity: isAddingCard ? 0.6 : 1 }}
                >
                  <span className="plus-icon">+</span>
                  <span>
                    {isAddingCard ? "Adding..." : "Add a Payment method"}
                  </span>
                </button>
              </div>
            </div>
          )}
        </section>

        {/*  */}

        <section className="invoices-section">
          <h2 className="section-title">Invoices</h2>

          <div className="invoices-container">
            <div className="filter-container">
              <select
                className="date-filter"
                value={selectedDateFilter}
                onChange={(e) => changeDateFilter(e.target.value)}
              >
                <option>All Dates</option>
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
                <option>This Year</option>
              </select>
            </div>

            <div className="table-wrapper">
              <table className="invoices-table">
                <thead>
                  <tr>
                    <th>Date / Invoice</th>
                    <th>Description</th>
                    <th>Payment Method</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {orders.length > 0 ? (
                    orders.map((order) => {
                      const date = new Date(order.createdAt);

                      const cardBrand =
                        order?.paymentMethod?.pluginInfo?.properties?.find(
                          (p) => p.key === "card_brand",
                        )?.value;

                      const last4 =
                        order?.paymentMethod?.pluginInfo?.properties?.find(
                          (p) => p.key === "card_last4",
                        )?.value;

                      return (
                        <tr key={order.id}>
                          {/* Date + Invoice */}
                          <td>
                            <div className="invoice-date">
                              {date.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </div>

                            <div className="invoice-number">
                              {order.orderCode}
                              <svg
                                className="external-icon"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                              </svg>
                            </div>
                          </td>

                          <td>
                            <div className="order-id">
                              Order ID : #{order.id}
                              <svg
                                className="external-icon"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                              </svg>
                            </div>
                          </td>

                          {/* Payment */}
                          <td>
                            <div className="payment-method">
                              <span className="visa-badge">
                                {cardBrand?.toUpperCase() ||
                                  order.paymentMethodType}
                              </span>

                              {last4 && (
                                <span className="card-last4">••••{last4}</span>
                              )}
                            </div>
                          </td>

                          <td>
                            <span className="status-badge">{order.status}</span>
                          </td>

                          <td className="total-amount">
                            {order.totalPriceIncTax} {order.currencyCode}
                          </td>

                          <td>
                            <button className="print-btn">
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                <rect x="6" y="14" width="12" height="8"></rect>
                              </svg>
                              Print
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        style={{ textAlign: "center", padding: "20px" }}
                      >
                        No invoices found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/*  */}
      </div>
      <ConfirmDialog
        open={confirmOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Remove Card"
        message="Are you sure you want to remove this payment method?"
        confirmText="Remove"
        cancelText="Cancel"
      />
    </>
  );
};

export default PaymentsAndInvoices;
