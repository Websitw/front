import React from 'react';
import { Controller } from 'react-hook-form';
import './FormComponents.css';

const FormInputWithButton = ({
  label,
  name,
  type = 'text',
  placeholder = '',
  required = false,
  disabled = false,
  description = '',
  buttonIcon,
  onButtonClick,
  className = '',
  control,
  error
}) => {
  return (
    <div className={`form-group ${className}`}>
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="form-required">*</span>}
      </label>
      <div className="form-input-button-wrapper">
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <input
              {...field}
              id={name}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              className={`form-input form-input-with-button ${error ? 'form-input-error' : ''}`}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? `${name}-error` : undefined}
            />
          )}
        />
        {buttonIcon && onButtonClick && (
          <button
            type="button"
            onClick={onButtonClick}
            className="form-input-button"
            aria-label="Generate code"
          >
            {buttonIcon}
          </button>
        )}
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

export default FormInputWithButton;