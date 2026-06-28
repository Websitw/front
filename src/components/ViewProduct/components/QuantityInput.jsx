import { ChevronUp, ChevronDown } from "lucide-react";

const QuantityInput = ({ value, onChange, min = 1, max = 99, error }) => {
  const handleDecrement = () => {
    if (value > min) onChange(value - 1);
  };
  const handleIncrement = () => {
    if (value < max) onChange(value + 1);
  };
  const handleChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= min && val <= max) {
      onChange(val);
    }
  };

  return (
    <div className="quantity-wrapper">
      <div className={`quantity-input ${error ? "has-error" : ""}`}>
        <input
          type="text"
          value={String(value).padStart(2, "0")}
          onChange={handleChange}
          className="qty-value"
          inputMode="numeric"
        />
        <div className="qty-arrows">
          <button type="button" className="qty-arrow" onClick={handleIncrement}>
            <ChevronUp size={14} />
          </button>
          <button type="button" className="qty-arrow" onClick={handleDecrement}>
            <ChevronDown size={14} />
          </button>
        </div>
      </div>
      {error && <span className="field-error">{error}</span>}
    </div>
  );
};

export default QuantityInput;