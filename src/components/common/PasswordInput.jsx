import React, { useState } from 'react';
import { Controller } from 'react-hook-form';
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";import './FormComponents.css';

const PasswordInput = ({
  label,
  name,
  placeholder = '••••••••',
  required = false,
  disabled = false,
  className = '',
  variant = 'borderless', // 'bordered' | 'borderless'
  bgColor,
  control,
  error,
  styleLabel={},
  styleButton={},
  style={}
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`form-group ${className}`}>
      <label htmlFor={name} className="form-label" style={styleLabel}>
        {label}
        {required && <span className="form-required">*</span>}
      </label>

      <div className="form-password-wrapper">
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <input
              {...field}
              id={name}
              type={showPassword ? 'text' : 'password'}
              placeholder={placeholder}
              disabled={disabled}
              className={`form-input form-input-${variant} form-password-input ${error ? 'form-input-error' : ''}`}
              style={bgColor ? { backgroundColor: bgColor, ...style } : style}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? `${name}-error` : undefined}
            />
          )}
        />

        <button
          style={styleButton}
          type="button"
          className="form-password-toggle"
          onClick={togglePasswordVisibility}
          disabled={disabled}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <VisibilityOffIcon  style={{ color: '#B4B4B4' }}  className="form-password-icon" />
          ) : (
            <RemoveRedEyeIcon style={{ color: '#B4B4B4' }}  className="form-password-icon" />
          )}
        </button>
      </div>

      {error && (
        <span id={`${name}-error`} className="form-error-message" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default PasswordInput;
