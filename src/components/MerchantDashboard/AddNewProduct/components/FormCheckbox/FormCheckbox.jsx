import React from 'react';
import { Controller } from 'react-hook-form';
import './FormCheckbox.css';

const FormCheckbox = ({
  label,
  name,
  control,
  checked,
  onChange,
  disabled = false,
  className = '',
  description = '',
  descriptionLink = null,
  variant = 'default',
  error,
}) => {
  const renderCheckbox = (isChecked, handleChange) => (
    <label className={`form-checkbox ${className} form-checkbox--${variant} ${isChecked ? 'form-checkbox--checked' : ''}`}>
      <input
        type="checkbox"
        checked={isChecked}
        onChange={handleChange}
        disabled={disabled}
        className="form-checkbox__input"
      />
      <span className={`form-checkbox__box ${variant === 'filled' && isChecked ? 'form-checkbox__box--filled' : ''}`} />
      <div className="form-checkbox__content">
        <span className="form-checkbox__label">{label}</span>
        {description && (
          <span className="form-checkbox__desc">
            {description}
            {descriptionLink && (
              <>
                {' '}
                <a
                  href={descriptionLink.href}
                  className="form-checkbox__link"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  {descriptionLink.text}
                </a>
              </>
            )}
          </span>
        )}
      </div>
    </label>
  );

  if (name && control) {
    return (
      <div className="form-checkbox-wrapper">
        <Controller
          name={name}
          control={control}
          render={({ field }) =>
            renderCheckbox(field.value ?? false, (e) => {
              field.onChange(e.target.checked);
            })
          }
        />
        {error && (
          <span className="form-checkbox__error" role="alert">{error}</span>
        )}
      </div>
    );
  }

  return renderCheckbox(checked, onChange);
};

export default FormCheckbox;