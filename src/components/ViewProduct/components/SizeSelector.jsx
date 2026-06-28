const SizeSelector = ({ label = "Size", sizes, value, onChange, error }) => {
  return (
    <div className="form-field-view-product">
      <label className="field-label-view-product">{label}</label>
      <div className="size-options-view-product">
        {sizes?.map((size) => (
          <button
            key={size.value}
            type="button"
            className={`size-btn-view-product ${value === size.value ? "selected" : ""}`}
            onClick={() => onChange(size.value)}
          >
            {size.label}
          </button>
        ))}
      </div>
      {error && <span className="field-error-view-product">{error}</span>}
    </div>
  );
};

export default SizeSelector;