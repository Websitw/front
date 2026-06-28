import React from 'react';
import CustomSwitch from '../../../../common/CustomSwitch';
import './ToggleRow.css';

const ToggleRow = ({
  label,
  checked,
  onChange,
  disabled = false,
  className = '',
  activeColor = '#0d7c85',
}) => {
  return (
    <div className={`toggle-row ${className}`}>
      <span className="toggle-row__label">{label}</span>
      <CustomSwitch
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        containerWidth={40}
        containerHeight={20}
        thumbWidth={16}
        thumbHeight={16}
        activeColor={activeColor}
      />
    </div>
  );
};

export default ToggleRow;