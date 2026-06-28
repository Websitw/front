import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPaymentMethods,
  addPaymentMethod,
  savePaymentMethod,
  removePaymentMethod,
  setSelectedPaymentMethod,
  setSelectedDateFilter,
  clearPaymentError,
  resetPaymentState,
} from "../store/slices/paymentSlice";
import { showToast } from "../components/CustomToast/CustomToast";

const STRIPE_REDIRECT_BASE =
  "https://futeric.com/stripe/pcheckout.html";

const cardLogoUrls = {
  visa: "https://cdn-icons-png.flaticon.com/512/5968/5968397.png",
  mastercard:
    "https://upload.wikimedia.org/wikipedia/commons/7/72/MasterCard_early_1990s_logo.png",
};

const usePayment = () => {
  const dispatch = useDispatch();
  const {
    paymentMethods,
    selectedPaymentMethodId,
    isLoading,
    isAddingCard,
    isRemoving,
    error,
    selectedDateFilter,
  } = useSelector((state) => state.payment);

  const loadPaymentMethods = useCallback(() => {
    dispatch(fetchPaymentMethods());
  }, [dispatch]);

  useEffect(() => {
    loadPaymentMethods();
  }, [loadPaymentMethods]);

  const getCardProp = useCallback((payment, key, fallback) => {
    return payment.properties.find((p) => p.key === key)?.value || fallback;
  }, []);

  const getCardBrand = useCallback(
    (payment) => getCardProp(payment, "card_brand", "default-brand"),
    [getCardProp],
  );

  const getCardLast4 = useCallback(
    (payment) => getCardProp(payment, "card_last4", "0000"),
    [getCardProp],
  );

  const getCardExpMonth = useCallback(
    (payment) => getCardProp(payment, "card_exp_month", "00"),
    [getCardProp],
  );

  const getCardExpYear = useCallback(
    (payment) => getCardProp(payment, "card_exp_year", "0000"),
    [getCardProp],
  );

  const getCardLogoUrl = useCallback((brand) => {
    return cardLogoUrls[brand.toLowerCase()] || null;
  }, []);

  const selectPaymentMethod = useCallback(
    (paymentMethodId) => {
      dispatch(setSelectedPaymentMethod(paymentMethodId));
    },
    [dispatch],
  );

  const changeDateFilter = useCallback(
    (date) => {
      dispatch(setSelectedDateFilter(date));
    },
    [dispatch],
  );

  const openStripePopup = useCallback(
    (publishableKey, sessionId) => {
      const redirectUrl = `${STRIPE_REDIRECT_BASE}?publishablekey=${publishableKey}&sessionIdx=${sessionId}`;
      const popupWidth = 600;
      const popupHeight = 700;
      const left = (window.screen.availWidth - popupWidth) / 2;
      const top = (window.screen.availHeight - popupHeight) / 2;

      const popup = window.open(
        redirectUrl,
        "stripe-payment",
        `width=${popupWidth},height=${popupHeight},top=${top},left=${left},scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,directories=no,status=no`,
      );

      if (popup) {
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            if (localStorage.getItem("SESSION_ID")) {
              dispatch(savePaymentMethod()).then(() => loadPaymentMethods());
            }
          }
        }, 100);

        const messageListener = (event) => {
          if (event.origin !== window.location.origin) return;

          if (event.data.type === "PAYMENT_SUCCESS") {
            popup.close();
            clearInterval(checkClosed);
            window.removeEventListener("message", messageListener);
            showToast.success("Payment method added successfully!");
            dispatch(savePaymentMethod()).then(() => loadPaymentMethods());
          } else if (event.data.type === "PAYMENT_CANCELLED") {
            popup.close();
            clearInterval(checkClosed);
            window.removeEventListener("message", messageListener);
            localStorage.removeItem("SESSION_ID");
            showToast.error("Payment method addition was cancelled.");
          }
        };

        window.addEventListener("message", messageListener);
      } else {
        window.location.href = redirectUrl;
      }
    },
    [dispatch, loadPaymentMethods],
  );

  const submitAddCard = useCallback(async () => {
    const xPayId = localStorage.getItem("xPayId");
    const userToken = localStorage.getItem("token");
    const authData = localStorage.getItem("userData");

    if (!xPayId || !userToken || !authData) return;

    const authDataParsed = JSON.parse(authData);
    const username = authDataParsed?.name

    const body = {
      name: username,
      email: authDataParsed.email || "",
      currency: "JOD",
      country: "JO",
      city: "Amman",
      address: "Default Address",
      phone: authDataParsed.regMobileNumber || "",
    };

    try {
      const res = await dispatch(addPaymentMethod(body)).unwrap();

      if (res.code === 200 && res.result?.formFields) {
        const publishableKey = res.result.formFields.find(
          (field) => field.key === "publishable_key",
        )?.value;

        const id = res.result.formFields.find(
          (field) => field.key === "id",
        )?.value;

        if (publishableKey && id) {
          localStorage.setItem("SESSION_ID", id);
          openStripePopup(publishableKey, id);
        }
      }
    } catch {
      showToast.error("Failed to add payment method. Please try again later.");
    }
  }, [dispatch, openStripePopup]);

  const deleteCard = useCallback(
    async (paymentMethodId) => {
      try {
        await dispatch(removePaymentMethod(paymentMethodId)).unwrap();
        showToast.success("Card removed successfully!");
      } catch {
        showToast.error("Failed to remove card.");
      }
    },
    [dispatch],
  );

  const resetPayment = useCallback(() => {
    dispatch(resetPaymentState());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearPaymentError());
  }, [dispatch]);

  return {
    paymentMethods,
    selectedPaymentMethodId,
    isLoading,
    isAddingCard,
    isRemoving,
    error,
    selectedDateFilter,

    getCardBrand,
    getCardLast4,
    getCardExpMonth,
    getCardExpYear,
    getCardLogoUrl,

    selectPaymentMethod,
    changeDateFilter,
    submitAddCard,
    deleteCard,
    loadPaymentMethods,
    resetPayment,
    clearError,
  };
};

export default usePayment;