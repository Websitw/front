import React from 'react';
// Import Controller from react-hook-form to connect the checkbox to form state
import { Controller } from 'react-hook-form';
import './FormComponents.css';

const FormCheckbox = ({
  label,
  name,
  disabled = false,
  className = '',
  control,
  width = '',
  height = '',
  style = {},
  styleCheckbox = {},
  error,
}) => {
  return (
    <div className={`form-checkbox-group ${className}`} style={styleCheckbox}>
      <Controller
      // Connect the checkbox to react-hook-form
        name={name}
        control={control} // Control object from useForm
        // Render function to connect input with form state
        render={({ field: { onChange, value } }) => ( // Destructure onChange and value from field
          <label className="form-checkbox-label">
            <input
              style={{
                ...(width && height ? {
                  width: `${width}px`,
                  height: `${height}px`,
                  minWidth: `${width}px`,
                  minHeight: `${height}px`
                } : {}),
                ...style
              }}
              type="checkbox"
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              disabled={disabled}
              className="form-checkbox-input"
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? `${name}-error` : undefined}
            />
            <span className="form-checkbox-custom"></span>
            <span className="form-checkbox-text">{label}</span>
          </label>
          
        )}
      />
      {error && (
        <>
        <span id={`${name}-error`} className="form-error-message" role="alert">
          {error}
        </span>
        </>
      )}
    </div>
  );
};

export default FormCheckbox;