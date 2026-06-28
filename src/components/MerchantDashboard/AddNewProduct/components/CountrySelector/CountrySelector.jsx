import React from 'react';
import { Controller } from 'react-hook-form';
import { Autocomplete, InputBase, Paper } from '@mui/material';
import { Plus, ChevronDown } from 'lucide-react';
import './CountrySelector.css';
import { imageUrl } from '../../../../../helper/helper';


const CountrySelector = ({
  label,
  name,
  control,
  value,
  onChange,
  onAdd,
  options = [],
  placeholder = 'All world',
  disabled = false,
  error,
  isAddable = true,
}) => {
  const allOptions = options;

  const renderAutocomplete = (selectValue, handleChange) => {
    const selected = allOptions.find((opt) => opt.value === selectValue) || ALL_OPTION;

    return (
      <div className="country-selector">
        {label && <span className="country-selector__label">{label}</span>}
        <div className={`country-selector__wrapper ${error ? 'country-selector__wrapper--error' : ''}`}>
          <Autocomplete
            fullWidth
            disabled={disabled}
            value={selected}
            onChange={(_, newValue) => handleChange(newValue?.value ?? 'all')}
            options={allOptions}
            getOptionLabel={(opt) => opt.label}
            isOptionEqualToValue={(option, val) => option.value === val.value}
            disableClearable
            popupIcon={null}
            PaperComponent={(props) => (
              <Paper
                {...props}
                sx={{
                  borderRadius: '5px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: '1px solid #b4b4b4',
                  mt: '4px',
                }}
              />
            )}
            renderOption={(props, opt) => {
              const { key, ...restProps } = props;
              return (
                <li
                  key={key}
                  {...restProps}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 12px',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: 14,
                    color: '#151515',
                  }}
                >
                  {opt.flag && (
                    <img
                      src={`${imageUrl}${opt.flag}`}
                      alt={opt.label}
                      className="country-selector__flag-img"
                      loading="lazy"
                    />
                  )}
                  <span>{opt.label}</span>
                </li>
              );
            }}
            renderInput={(params) => (
              <div ref={params.InputProps.ref} className="country-selector__input-wrapper">
                {selected?.flag && (
                  <img
                    src={`${imageUrl}${selected.flag}`}
                    alt={selected.label}
                    className="country-selector__flag-img"
                  />
                )}
                <InputBase
                  {...params.inputProps}
                  placeholder={placeholder}
                  disabled={disabled}
                  sx={{
                    flex: 1,
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: 16,
                    fontWeight: 400,
                    color: '#151515',
                    height: '100%',
                    '& input': {
                      padding: 0,
                      height: '100%',
                    },
                  }}
                />
              </div>
            )}
            sx={{
              flex: 1,
              height: '100%',
              '& .MuiAutocomplete-endAdornment': {
                display: 'none',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
            }}
          />

          {isAddable&&<button
            type="button"
            className="country-selector__add-btn"
            onClick={onAdd}
            disabled={disabled}
          >
            <Plus size={18} />
          </button>
  }
          <ChevronDown size={18} className="country-selector__chevron" />
        </div>
        {error && (
          <span className="country-selector__error" role="alert">{error}</span>
        )}
      </div>
    );
  };

  if (name && control) {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field }) =>
          renderAutocomplete(field.value ?? 'all', (val) => {
            field.onChange(val);
          })
        }
      />
    );
  }

  return renderAutocomplete(value, onChange);
};

export default CountrySelector;