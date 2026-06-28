import React from 'react';
import { Controller } from 'react-hook-form';
import { ChevronDown, X } from 'lucide-react';
import './FormComponents.css';

const FormMultiSelect = ({
  label,
  name,
  options = [],
  placeholder = '',
  required = false,
  disabled = false,
  multiple = false,
  className = '',
  control,
  error
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDisplayValue = (value) => {
    if (!value) return placeholder;
    if (multiple && Array.isArray(value)) {
      if (value.length === 0) return placeholder;
      return `${value.length} items selected`;
    }
    const option = options.find(opt => opt.value === value);
    return option ? option.label : placeholder;
  };

  const handleToggle = (currentValue, onChange) => {
    if (disabled) return;

    if (multiple && Array.isArray(currentValue)) {
      return (option) => {
        const exists = currentValue.some(v => v.value === option.value);
        const newValue = exists
          ? currentValue.filter(v => v.value !== option.value)
          : [...currentValue, option];
        onChange(newValue);
      };
    } else {
      return (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
      };
    }
  };

  const removeItem = (e, value, currentValue, onChange) => {
    e.stopPropagation();
    if (multiple && Array.isArray(currentValue)) {
      onChange(currentValue.filter(v => v.value !== value));
    }
  };

  const getSelectedLabels = (value) => {
    if (!value || !Array.isArray(value)) return [];
    return value;
  };

  return (
    <div className={`form-group ${className}`} ref={selectRef}>
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="form-required">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => (
          <>
            <div className="form-select-wrapper">
              <div
                className={`form-select ${error ? 'form-input-error' : ''} ${disabled ? 'form-select-disabled' : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setIsOpen(!isOpen);
                  }
                }}
              >
                {multiple && Array.isArray(value) && value.length > 0 ? (
                  <div className="form-select-chips">
                    {getSelectedLabels(value).map(item => (
                      <span key={item.value} className="form-select-chip">
                        {item.label}
                        <button
                          type="button"
                          onClick={(e) => removeItem(e, item.value, value, onChange)}
                          className="form-select-chip-remove"
                          aria-label={`Remove ${item.label}`}
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className={value ? '' : 'form-select-placeholder'}>
                    {getDisplayValue(value)}
                  </span>
                )}
                <ChevronDown
                  className={`form-select-icon ${isOpen ? 'form-select-icon-open' : ''}`}
                  size={20}
                />
              </div>

              {isOpen && (
                <div className="form-select-dropdown">
                  {options.map(option => {
                    const isSelected = multiple
                      ? Array.isArray(value) && value.some(v => v.value === option.value)
                      : value === option.value;

                    return (
                      <div
                        key={option.value}
                        className={`form-select-option ${isSelected ? 'form-select-option-selected' : ''}`}
                        onClick={() => handleToggle(value, onChange)(option)}
                        role="option"
                        aria-selected={isSelected}
                      >
                        {multiple && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="form-select-checkbox"
                          />
                        )}
                        {option.icon && <span className="form-select-option-icon">{option.icon}</span>}
                        <span className="form-select-option-label">{option.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
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

export default FormMultiSelect;