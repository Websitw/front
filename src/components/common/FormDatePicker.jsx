import React from 'react';
import { Controller } from 'react-hook-form';
import { Calendar } from 'lucide-react';
import './FormComponents.css';

const FormDatePicker = ({
  label,
  name,
  required = false,
  disabled = false,
  placeholder = '',
  description = '',
  className = '',
  control,
  error,
  bgColor,
  variant,
  styleLabel = {},
}) => {
  return (
    <div className={`form-group ${className}`}>
      <label  htmlFor={name} className="form-label" style={styleLabel}>
        {label}
        {required && <span className="form-required">*</span>}
      </label>
      <div className={`form-date-picker-wrapper ${variant === "bordered" ? "form-input-bordered" : ""}`}>
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            // Render a date input field
            <input
              {...field} // Spread field properties to connect input with form state
              id={name}
              type="date"
              style={{ backgroundColor: bgColor }}
              placeholder={placeholder}
              disabled={disabled}
              className={`form-input form-date-input ${error ? 'form-input-error' : ''}`}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? `${name}-error` : undefined}
            />
          )}
        />
        <Calendar className="form-date-icon" size={20} />
      </div>
      {description && (
        <p className="form-field-description">{description}</p>
      )}
      {error && (
        <span id={`${name}-error`} className="form-error-message" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default FormDatePicker;