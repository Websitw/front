import React from "react";
import { Controller } from "react-hook-form";
import { ChevronDown } from "lucide-react";
import "./FormComponents.css";

const FormSelect = ({
  label,
  name,
  options = [],
  required = false,
  disabled = false,
  placeholder = "Select an option",
  className = "",
  variant = "borderless", // 'bordered' | 'borderless'
  bgColor, // Custom background color (CSS value or variable)
  control,
  error,
  style = {},
  styleLabel = {},
  showInfoIcon = false,
  InfoIcon = null,
}) => {
  return (
    <div className={`form-group ${className}`}>
      
      {!showInfoIcon && <label htmlFor={name} className="form-label" style={styleLabel}>
        {label}
        {required && <span className="form-required">*</span>}
      </label>
      }

      {showInfoIcon && InfoIcon && (
        <div className="label-with-icon flex-center-row">
          <label htmlFor={name} className="form-label" style={styleLabel}>
            {label}
            {required && <span className="form-required">*</span>}
          </label>
          <InfoIcon className="info-icon" size={16} />
        </div>
      )}

      <div className="form-select-wrapper">
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <div>
              <select
                {...field}
                id={name}
                disabled={disabled}
                className={`form-select form-select-${variant} ${
                  error ? "form-input-error" : ""
                }`}
                style={bgColor ? { backgroundColor: bgColor, ...style } : style}
                aria-invalid={error ? "true" : "false"}
                aria-describedby={error ? `${name}-error` : undefined}
              >
                {placeholder && (
                  <option value="" disabled>
                    {placeholder}
                  </option>
                )}
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        />
        <ChevronDown className="form-select-icon" size={20} />
      </div>
      {error && (
        <span id={`${name}-error`} className="form-error-message" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default FormSelect;
