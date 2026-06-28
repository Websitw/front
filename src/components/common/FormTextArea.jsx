import React from 'react';
import { Controller } from 'react-hook-form';
import './FormComponents.css';

const FormTextArea = ({
  label,
  name,
  placeholder = '',
  required = false,
  disabled = false,
  rows = 4,
  maxLength,
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
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <>
            <textarea
              {...field}
              id={name}
              placeholder={placeholder}
              disabled={disabled}
              rows={rows}
              maxLength={maxLength}
              className={`form-textarea ${error ? 'form-input-error' : ''}`}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? `${name}-error` : undefined}
            />
            {maxLength && (
              <div className="form-character-count">
                {field.value?.length || 0} / {maxLength}
              </div>
            )}
          </>
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

export default FormTextArea;