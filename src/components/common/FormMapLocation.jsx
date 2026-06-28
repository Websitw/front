import React, { useState, useCallback } from 'react';
import { Controller } from 'react-hook-form';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import './FormComponents.css';

const FormMapLocation = ({
  label,
  name,
  required = false,
  className = '',
  control,
  error,
  apiKey = ''
}) => {
  const defaultCenter = { lat: 31.9539, lng: 35.9106 };

  return (
    <div className={`form-group ${className}`}>
      <label className="form-label">
        {label}
        {required && <span className="form-required">*</span>}
      </label>
      
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => {
          const currentPosition = value 
            ? { 
                lat: parseFloat(value.split(',')[0]), 
                lng: parseFloat(value.split(',')[1]) 
              }
            : defaultCenter;

          const handleMapClick = (event) => {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            onChange(`${lat},${lng}`);
          };

          return (
            <div className={`form-map-container ${error ? 'form-map-error' : ''}`}>
              <LoadScript googleMapsApiKey={apiKey}>
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={currentPosition}
                  zoom={12}
                  onClick={handleMapClick}
                >
                  <Marker position={currentPosition} />
                </GoogleMap>
              </LoadScript>
            </div>
          );
        }}
      />
      
      {error && (
        <span className="form-error-message" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default FormMapLocation;