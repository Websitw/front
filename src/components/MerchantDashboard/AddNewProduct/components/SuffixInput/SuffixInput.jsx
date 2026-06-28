import React from 'react';
import { Controller } from 'react-hook-form';
import './SuffixInput.css';

const SuffixInput = ({
  label,
  name,
  placeholder = '',
  suffix = '',
  control,
  error,
  disabled = false,
  className = '',
  labelIcon = null,
}) => {
  return (
    <div className={`suffix-input ${className}`}>
      {label && (
        <div className="suffix-input__label-row">
          <label htmlFor={name} className="suffix-input__label">
            {label}
          </label>
          {labelIcon && <span className="suffix-input__label-icon">{labelIcon}</span>}
        </div>
      )}
      <div className={`suffix-input__wrapper ${error ? 'suffix-input__wrapper--error' : ''}`}>
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <input
              {...field}
              id={name}
              type="text"
              placeholder={placeholder}
              disabled={disabled}
              className="suffix-input__field"
            />
          )}
        />
        {suffix && <span className="suffix-input__suffix">{suffix}</span>}
      </div>
      {error && (
        <span className="suffix-input__error" role="alert">{error}</span>
      )}
    </div>
  );
};

export default SuffixInput;