const PurchaseTypeToggle = ({ value, onChange, hasWholesale = false }) => {
  const options = hasWholesale ? ["retail", ] : ["retail"];

  return (
    <div className="purchase-toggle">
      {options.map((type) => (
        <button
          key={type}
          type="button"
          className={`toggle-btn ${value === type ? "active" : ""}`}
          onClick={() => onChange(type)}
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </button>
      ))}
    </div>
  );
};

export default PurchaseTypeToggle;