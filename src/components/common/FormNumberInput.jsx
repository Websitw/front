import React from 'react';
import { Controller } from 'react-hook-form';
import './FormComponents.css';

const FormNumberInput = ({
  label,
  name,
  placeholder = '',
  required = false,
  disabled = false,
  min = 0,
  max,
  step = 1,
  suffix = '',
  description = '',
  className = '',
  control,
  error,
  variant = 'borderless', // 'bordered' | 'borderless'
  bgColor, 
  styleLabel = {},
}) => {
  return (
    <div className={`form-group ${className}`}>
      <label htmlFor={name} className="form-label" style={styleLabel}>
        {label}
        {required && <span className="form-required">*</span>}
      </label>
      <div className="form-number-input-wrapper">
        <Controller
          name={name}
          control={control}
          render={({ field: { onChange, value, ...field } }) => (
            <input
              {...field}
              value={value ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                onChange(val === '' ? '' : Number(val));
              }}
              id={name}
              type="number"
              placeholder={placeholder}
              disabled={disabled}
              min={min}
              max={max}
              step={step}
              style={bgColor ? { backgroundColor: bgColor } : undefined}
              className={`form-input form-number-input ${variant === 'bordered' ? 'form-input-bordered' : ''} ${suffix ? 'has-suffix' : ''} ${error ? 'form-input-error' : ''}`}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? `${name}-error` : undefined}
            />
          )}
        />
        {suffix && <span className="form-number-suffix">{suffix}</span>}
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

export default FormNumberInput;