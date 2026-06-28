const ColorSelector = ({ colors, value, onChange, error }) => {
  return (
    <div className="form-field-view-product">
      <label className="field-label-view-product">Color</label>
      <div className="color-options-view-product">
        {colors.map((color) => (
          <button
            key={color.value}
            type="button"
            className={`color-btn-view-product ${value === color.value ? "selected" : ""}`}
            onClick={() => onChange(color.value)}
          >
            <span className="color-dot-view-product" style={{ backgroundColor: color.hex }} />
            {color.label}
          </button>
        ))}
      </div>
      {error && <span className="field-error-view-product">{error}</span>}
    </div>
  );
}
export default ColorSelector;
