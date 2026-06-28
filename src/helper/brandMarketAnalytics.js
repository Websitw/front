export const trackBrandMarketEvent = (eventName, payload = {}) => {
  if (typeof window === "undefined") {
    return;
  }

  const detail = {
    event: eventName,
    ...payload,
    timestamp: Date.now(),
  };

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push(detail);
  }

  window.dispatchEvent(
    new CustomEvent("sawa:analytics", {
      detail,
    }),
  );
};
