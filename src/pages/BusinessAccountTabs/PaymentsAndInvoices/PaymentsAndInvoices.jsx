import React, { useState, useEffect } from "react";
import { EditIcon } from "../../../assets/icons";
import axios from "axios";
import { environment } from "../../../environments/environment";
import { showToast } from "../../../components/CustomToast/CustomToast";
import LoadingSpinner from "../../../components/common/LoadingSpinner/LoadingSpinner";
import Loading from "../../../components/Loading/Loading";

const LocalstorageKeys = {
  XPAY_ID: "xpayId",
  TOKEN: "token",
  AUTH_DATA: "authData",
  SESSION_ID: "sessionId",
};

const cardLogoUrls = {
  visa: "https://cdn-icons-png.flaticon.com/512/5968/5968397.png",
  mastercard:
    "https://upload.wikimedia.org/wikipedia/commons/7/72/MasterCard_early_1990s_logo.png",
};

const PaymentsAndInvoices = () => {
  const [selectedDate, setSelectedDate] = useState("All Dates");
  const [filteredArray, setFilteredArray] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [isCardsLoading, setIsCardsLoading] = useState(true);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const TOKEN = localStorage.getItem("token");

  const getCart = async () => {
    try {
      const url = `${environment.serverOrigin}xPayAccounts/${localStorage.getItem("xPayId")}/paymentMethod/${localStorage.getItem("SESSION_ID")}`;
      await axios.post(
        url,
        {
          pluginName: "xpay-stripe",
          isDefault: false,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      localStorage.removeItem("sessionIdx");
    } catch (err) {
      console.log("error", err);
    }
  };

  const addCard = async (xpayId, body) => {
    const response = await axios.post(
      `${environment.serverOrigin}xPayStripe/xpay-stripe/checkout?kbAccountId=${xpayId}&paymentMethodTypes=card`,
      body,
      { headers: { Authorization: `Bearer ${TOKEN}` } },
    );
    return response.data;
  };

  const redirectToStripe = (publishableKey, sessionId) => {
    return `https://futeric.com/stripe/pcheckout.html?publishablekey=${publishableKey}&sessionIdx=${sessionId}`;
  };

  const handlePaymentCompletion = async () => {
    if (localStorage.getItem("SESSION_ID")) {
      await getCart();
      await getUserCard();
    }
  };

  const handlePaymentSuccess = async () => {
    showToast.success("Payment method added successfully!");
    await getCart();
    await getUserCard();
  };

  const handlePaymentCancellation = () => {
    alert("Payment method addition was cancelled.");
    if (localStorage.getItem(LocalstorageKeys.SESSION_ID)) {
      localStorage.removeItem(LocalstorageKeys.SESSION_ID);
    }
  };

  const listenForPopupCompletion = (popup) => {
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        handlePaymentCompletion();
      }
    }, 100);

    const messageListener = (event) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data.type === "PAYMENT_SUCCESS") {
        popup.close();
        clearInterval(checkClosed);
        window.removeEventListener("message", messageListener);
        handlePaymentSuccess();
      } else if (event.data.type === "PAYMENT_CANCELLED") {
        popup.close();
        clearInterval(checkClosed);
        window.removeEventListener("message", messageListener);
        handlePaymentCancellation();
      }
    };

    window.addEventListener("message", messageListener);
  };

  const getCardBrand = (payment) => {
    console.log("payment properties:", payment);
    return (
      payment.properties.find((p) => p.key === "card_brand")?.value ||
      "default-brand"
    );
  };

  const getCardLast4 = (payment) => {
    return (
      payment.properties.find((p) => p.key === "card_last4")?.value || "0000"
    );
  };

  const getCardExpMonth = (payment) => {
    return (
      payment.properties.find((p) => p.key === "card_exp_month")?.value || "00"
    );
  };

  const getCardExpYear = (payment) => {
    return (
      payment.properties.find((p) => p.key === "card_exp_year")?.value || "0000"
    );
  };

  const getCardLogoUrl = (brand) => {
    return cardLogoUrls[brand.toLowerCase()] || null;
  };

  const onPaymentMethodSelect = (paymentMethodId) => {
    setSelectedPaymentMethod(paymentMethodId);
  };

  const onSubmitAddCard = async () => {
    const xPayId = localStorage.getItem("xPayId");
    const userToken = localStorage.getItem("token");
    const authData = localStorage.getItem("userData");

    if (!xPayId || !userToken || !authData) return;

    const authDataParsed = JSON.parse(authData);
    const username = authDataParsed.email.split("@")[0];

    const body = {
      name: username,
      email: authDataParsed.email || "",
      currency: "JOD",
      country: "JO",
      city: "Amman",
      address: "Default Address",
      phone: authDataParsed.regMobileNumber || "",
    };

    setIsAddingCard(true);

    try {
      const res = await addCard(xPayId, body);
      setIsAddingCard(false);

      if (res.code === 200 && res.result?.formFields) {
        const publishableKey = res.result.formFields.find(
          (field) => field.key === "publishable_key",
        )?.value;

        const id = res.result.formFields.find(
          (field) => field.key === "id",
        )?.value;

        localStorage.setItem("SESSION_ID", id);

        if (publishableKey && id) {
          const redirectUrl = redirectToStripe(publishableKey, id);

          const popupWidth = 600;
          const popupHeight = 700;
          const screenWidth = window.screen.availWidth;
          const screenHeight = window.screen.availHeight;
          const left = (screenWidth - popupWidth) / 2;
          const top = (screenHeight - popupHeight) / 2;

          const popup = window.open(
            redirectUrl,
            "stripe-payment",
            `width=${popupWidth},height=${popupHeight},top=${top},left=${left},scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,directories=no,status=no`,
          );

          if (popup) {
            listenForPopupCompletion(popup);
          } else {
            window.location.href = redirectUrl;
          }
        }
      }
    } catch (err) {
      setIsAddingCard(false);
      showToast.error("Failed to add payment method. Please try again later.");
    }
  };

  const getUserCard = async () => {
    try {
      setIsCardsLoading(true);
      const cardIDURL = `${environment.serverOrigin}xPayAccounts/${localStorage.getItem("xPayId")}/getpaymentmethods?withPluginInfo=true&includedDeleted=false&audit=NONE`;

      const response = await axios.get(cardIDURL, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const cards = response.data.result;
      const filtered = cards.map((item) => ({
        paymentMethodId: item.paymentMethodId,
        properties: item.pluginInfo.properties,
      }));

      setFilteredArray(filtered);

      if (filtered.length > 0) {
        setSelectedPaymentMethod(filtered[0].paymentMethodId);
      }

      setIsCardsLoading(false);
    } catch (error) {
      setIsCardsLoading(false);
    }
  };

  useEffect(() => {
    getUserCard();
  }, []);

  return (
    <>
      <div className="container-payments-invoices">
        <section className="payment-methods-section">
          <h1 className="section-title">Payment methods</h1>
            {isCardsLoading ? (
              <LoadingSpinner />
            ) : (
          <div className="cards-grid">
            {isCardsLoading && (
              <div
                className="card payment-card loading-card"
               
              >
                <LoadingSpinner />
              </div>
            )}

            {!isCardsLoading && filteredArray.length === 0 && (
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

            {!isCardsLoading &&
              filteredArray.map((payment) => {
                const brand = getCardBrand(payment);
                const logoUrl = getCardLogoUrl(brand);

                return (
                  <div
                    key={payment.paymentMethodId}
                    className="card payment-card"
                    onClick={() =>
                      onPaymentMethodSelect(payment.paymentMethodId)
                    }
                    style={{
                      cursor: "pointer",
                      border:
                        selectedPaymentMethod === payment.paymentMethodId
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
                            selectedPaymentMethod === payment.paymentMethodId
                              ? "var(--color-primary)"
                              : undefined,
                        }}
                      >
                        <div
                          className="radio-inner"
                          style={{
                            backgroundColor:
                              selectedPaymentMethod === payment.paymentMethodId
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
                    <span className="remove-card-payment">Remove Card</span>
                  </div>
                );
              })}

            {isCardsLoading ? null : (
              <div className="card add-payment-card">
                <button
                  className="add-payment-btn"
                  onClick={onSubmitAddCard}
                  disabled={isAddingCard}
                  style={{ opacity: isAddingCard ? 0.6 : 1 }}
                >
                  <span className="plus-icon">+</span>
                  <span>
                    {isAddingCard ? "Adding..." : "Add a Payment method"}
                  </span>
                </button>
              </div>
            )}
          </div>
            )}
        </section>

        <section className="invoices-section">
          <h2 className="section-title">Invoices</h2>

          <div className="invoices-container">
            <div className="filter-container">
              <select
                className="date-filter"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
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
                  <tr>
                    <td>
                      <div className="invoice-date">Nov 3, 2025</div>
                      <div className="invoice-number">
                        203211111
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
                        Order ID : #2930541
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
                      <div className="payment-method">
                        <span className="visa-badge">VISA</span>
                        <span className="card-last4">••••5555</span>
                      </div>
                    </td>
                    <td>
                      <span className="status-badge">PAID</span>
                    </td>
                    <td className="total-amount">$120.60</td>
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
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default PaymentsAndInvoices;
