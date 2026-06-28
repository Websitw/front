import React from 'react';
import { Controller } from 'react-hook-form';
import './FormComponents.css';

const FormCoordinateInputs = ({
  name,
  control,
  className = ''
}) => {
  const defaultCenter = { lat: 31.9539, lng: 35.9106 };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value } }) => {
        const currentPosition = value 
          ? { 
              lat: parseFloat(value.split(',')[0]), 
              lng: parseFloat(value.split(',')[1]) 
            }
          : defaultCenter;

        return (
          <div className={`coordinates-inputs ${className}`}>
            <div className="coordinate-input-group">
              <input
                type="text"
                value={currentPosition.lat.toFixed(6)}
                disabled
                className="coordinate-input"
                placeholder="Latitude"
              />
              <span className="coordinate-label">N</span>
            </div>
            
            <div className="coordinate-input-group">
              <input
                type="text"
                value={currentPosition.lng.toFixed(6)}
                disabled
                className="coordinate-input"
                placeholder="Longitude"
              />
              <span className="coordinate-label">E</span>
            </div>
          </div>
        );
      }}
    />
  );
};

export default FormCoordinateInputs;