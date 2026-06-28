import React, { useRef } from 'react';
import { Controller } from 'react-hook-form';
import { UploadIcon } from '../../assets/icons';
import './FormComponents.css';

const FormFileUpload = ({
  label,
  name,
  placeholder = 'Upload file',
  required = false,
  disabled = false,
  className = '',
  variant = 'bordered',
  bgColor,
  control,
  error,
  accept = '.pdf,.jpg,.jpeg,.png',
  maxSize = 5 * 1024 * 1024, // 5MB default
}) => {
  const fileInputRef = useRef(null);

  const handleFileClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const formatFileName = (fileName) => {
    if (!fileName) return '';
    if (fileName.length > 30) {
      return fileName.substring(0, 27) + '...';
    }
    return fileName;
  };

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="form-required">*</span>}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value, ...field } }) => (
          <div className="form-file-upload-input-wrapper">
            <input
              ref={fileInputRef}
              type="file"
              id={name}
              accept={accept}
              disabled={disabled}
              className="form-file-input"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (maxSize && file.size > maxSize) {
                    alert(`File size should not exceed ${maxSize / (1024 * 1024)}MB`);
                    return;
                  }
                  onChange(file);
                }
              }}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? `${name}-error` : undefined}
            />
            <div
              className={`form-file-upload-button form-input-${variant} ${error ? 'form-input-error' : ''} ${disabled ? 'form-input-disabled' : ''}`}
              style={bgColor ? { backgroundColor: bgColor } : undefined}
              onClick={handleFileClick}
            >
              <span className="form-file-upload-button-text">
                {value ? formatFileName(value.name) : placeholder}
              </span>
              <UploadIcon className="form-file-upload-button-icon" />
            </div>
          </div>
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

export default FormFileUpload;