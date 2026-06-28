import { Controller } from "react-hook-form";
import "./FormNumberInput.css";

const FormNumberInput = ({
  label,
  name,
  control,
  placeholder = "0",
  error,
  min,
  max,
  step = "1",
  disabled = false,
  required = false,
  className = "",
  style = {},
  styleLabel = {},
  styleGroup = {},
}) => {
  return (
    <div style={styleGroup} className={`fni-group ${className}`}>
      {label && (
        <label htmlFor={name} className="fni-label" style={styleLabel}>
          {label}
          {required && <span className="fni-required">*</span>}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <input
            {...field}
            id={name}
            type="number"
            placeholder={placeholder}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            className={`fni-input ${error ? "fni-input--error" : ""}`}
            style={style}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${name}-error` : undefined}
            onChange={(e) => field.onChange(e.target.value)}
          />
        )}
      />
      {error && (
        <span id={`${name}-error`} className="fni-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default FormNumberInput;