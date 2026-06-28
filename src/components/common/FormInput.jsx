import React from 'react';
import { Controller } from 'react-hook-form';
import './FormComponents.css';

const FormInput = ({
  label,
  name,
  type = 'text',
  placeholder = '',
  required = false,
  disabled = false,
  className = '',
  variant = 'borderless',
  bgColor, 
  control,
  error,
  styleLabel={},
  style={},
  styleGroup={},
}) => {
  return (
    <div 
    style={styleGroup}
    className={`form-group ${className}`} >
      <label htmlFor={name} className="form-label" style={styleLabel}>
        {label}
        {required && <span className="form-required">*</span>}
      </label>
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
            
            className={`form-input form-input-${variant} ${error ? 'form-input-error empty-inputs' : ''}`}
            style={bgColor ? { backgroundColor: bgColor, ...style } : style}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${name}-error` : undefined}
          />
        )}
      />
      {error && (
        <span id={`${name}-error`} className="form-error-message" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default FormInput;