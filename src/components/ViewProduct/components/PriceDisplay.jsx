const PriceDisplay = ({
  currentPrice,
  originalPrice,
  salePercent,
  currency,
  stock,
  isStockVisible = true,
  purchaseType,
  wholesalePriceList = [],
}) => {
  const showWholesaleTiers =
    purchaseType === "wholesale" && wholesalePriceList.length > 0;
    console.log("currentPrice, originalPrice, salePercent, currency, stock>>", {
      currentPrice,
      originalPrice,
      salePercent,
      currency,
      stock,
    });
  return (
    <div className="price-section">
      <div className="price-row">
        <span className="current-price">
          {currency}
          <span className="price-main">{Math.floor(currentPrice)}</span>.
          <span className="price-dots">
            {String(Math.round((currentPrice % 1) * 100)).padStart(2, "0")}
          </span>
        </span>
        {originalPrice > currentPrice && (
          <span className="original-price">
            {currency} {originalPrice.toFixed(2)}
          </span>
        )}
        {/* {salePercent > 0 && (
          <span className="sale-badge">-{Math.round(salePercent)}%</span>
        )} */}
        {isStockVisible && stock > 0 && (
          <span className="stock-warning">Only {stock} Left</span>
        )}
      </div>

      {showWholesaleTiers && (
        <div className="wholesale-tiers">
          <span className="wholesale-tiers-title">Wholesale Pricing</span>
          <div className="wholesale-tiers-list">
            {wholesalePriceList.map((tier) => (
              <div key={tier.minQty} className="wholesale-tier-item">
                <span className="tier-qty">{tier.minQty}+ units</span>
                <span className="tier-price">
                  {currency} {tier.price.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceDisplay;