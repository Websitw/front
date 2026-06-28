import React, { useRef, useState, useEffect } from 'react';
import { Controller } from 'react-hook-form';
import './ForgetPassword/ForegetPassord.css';

const OTPInput = ({
  label,
  name,
  length = 6,
  control,
  error,
  onComplete,
  resendText,
  resendTimer = 45,
  onResend,
  style={},
}) => {
  const inputRefs = useRef([]);
  const [timer, setTimer] = useState(resendTimer);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleResend = () => {
    if (canResend && onResend) {
      onResend();
      setTimer(resendTimer);
      setCanResend(false);
    }
  };

  const handleChange = (index, value, onChange, currentValue) => {
    // Only allow digits
    const digit = value.replace(/[^0-9]/g, '');
    
    if (digit.length > 1) {
      return;
    }

    // Update the value at the current index
    const newValue = currentValue.split('');
    newValue[index] = digit;
    const updatedValue = newValue.join('');
    
    onChange(updatedValue);

    // Move to next input if digit is entered
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if OTP is complete
    if (updatedValue.length === length && !updatedValue.includes('')) {
      if (onComplete) {
        onComplete(updatedValue);
      }
    }
  };

  const handleKeyDown = (index, e, currentValue, onChange) => {
    // Handle backspace
    if (e.key === 'Backspace' && !currentValue[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle left arrow
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle right arrow
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e, onChange) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/[^0-9]/g, '').slice(0, length);
    
    if (pastedData) {
      onChange(pastedData.padEnd(length, ''));
      
      // Focus the next empty input or the last one
      const nextIndex = Math.min(pastedData.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
      
      // Check if OTP is complete
      if (pastedData.length === length && onComplete) {
        onComplete(pastedData);
      }
    }
  };

  return (
    <div className="otp-container" style={style}>
      {label && <div className="otp-label">{label}</div>}
      
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value = '' } }) => (
          <div className="otp-inputs">
            {Array.from({ length }).map((_, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={value[index] || ''}
                onChange={(e) => handleChange(index, e.target.value, onChange, value)}
                onKeyDown={(e) => handleKeyDown(index, e, value, onChange)}
                onPaste={(e) => handlePaste(e, onChange)}
                className={`otp-input ${error ? 'otp-input-error' : ''}`}
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </div>
        )}
      />
      
      {error && (
        <span className="form-error-message" role="alert" style={{ textAlign: 'center', display: 'block' }}>
          {error}
        </span>
      )}
      
      {resendText && (
        <div className="otp-resend">
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              className="otp-resend-link"
              style={{ background: 'none', border: 'none', padding: 0, color:"var(--color-info)", cursor: 'pointer', textDecoration: 'underline' }}
            >
              Resend
            </button>
          ) : (
            <span>
              {resendText} in 0:{timer < 10 ? `0${timer}` : timer}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default OTPInput;