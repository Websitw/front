import React, { useState, useRef } from 'react'
import { useTranslation } from "react-i18next";

import { environment } from '../../environments/environment'
import { useNavigate } from "react-router-dom";
import './OTP.css';

const OTP = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [otp, setOtp] = useState(['', '', '', '', '' , '']);
    const [error, setError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const inputRefs = useRef([]);

    const handleChange = (index, value) => {
        if (isNaN(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        if (value !== '' && index < 4) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            if (otp[index] === '' && index > 0) {
                inputRefs.current[index - 1].focus();
            } else {
                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
            }
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 5);

        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = [...otp];
        for (let i = 0; i < pastedData.length; i++) {
            if (i < 5) {
                newOtp[i] = pastedData[i];
            }
        }
        setOtp(newOtp);

        const nextIndex = Math.min(pastedData.length, 4);
        inputRefs.current[nextIndex].focus();
    };

    const verifyOtpCode = async () => {
        setIsVerifying(true);
        setError('');

        const otpValue = otp.join('');

        if (otpValue.length !== 6) {
            setError('Please enter all 6 digits');
            setIsVerifying(false);
            return;
        }

        try {
            const otpTrailId = localStorage.getItem('REG_OTP_TRAIL_ID');
            const accessToken = localStorage.getItem('OTP_TOKEN');
            const platformServerOrigin = `${environment.platformServerOrigin}`
            const apiUrl = `${platformServerOrigin}v1/_otp/${otpTrailId}/${otpValue}`;

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                }
            });

            const data = await response.json();

            if (data.valid) {
                setIsVerifying(false);
                setOtp(['', '', '', '', '']);
                setError('');
                navigate('/UserManagement');
                console.log('OTP Verified Successfully');
            } else {
                setIsVerifying(false);
                setError('Invalid OTP. Please try again.');
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            setIsVerifying(false);
            setError('Failed to verify OTP. Please try again.');
        }
    };

    const handleSubmit = () => {
        verifyOtpCode();
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>{t("enterOtp")}</h1>
                <p style={styles.description}>{t("otpDescription")}</p>

                <div style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => (inputRefs.current[index] = el)}
                            type="text"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={handlePaste}
                            disabled={isVerifying}
                            style={{
                                ...styles.otpInput,
                                ...(error && !digit ? styles.otpInputError : {}),
                                ...(isVerifying ? styles.otpInputDisabled : {})
                            }}
                        />
                    ))}
                </div>

                {error && (
                    <div style={styles.errorMessage}>
                        <span style={styles.errorIcon}>⚠</span>
                        {error}
                    </div>
                )}

                <button 
                    onClick={handleSubmit} 
                    style={{
                        ...styles.submitBtn,
                        ...(isVerifying ? styles.submitBtnDisabled : {})
                    }}
                    disabled={isVerifying}
                >
                    {isVerifying ? t("verifying") || 'Verifying...' : t("submit")}
                </button>

                <div style={styles.resendContainer}>
                    <span style={styles.resendText}>{t("didntReceive")} </span>
                    <a href="#" style={styles.resendLink}>
                        {t("resend")}
                    </a>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        padding: '20px',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '450px',
        padding: '40px 30px',
        textAlign: 'center'
    },
    title: {
        fontSize: '28px',
        fontWeight: '500',
        color: '#666',
        margin: '0 0 15px 0'
    },
    description: {
        fontSize: '14px',
        color: '#666666',
        lineHeight: '1.5',
        margin: '0 0 35px 0'
    },
    otpContainer: {
        display: 'flex',
        justifyContent: 'center',
        gap: '12px',
        marginBottom: '25px',
        flexWrap: 'wrap'
    },
    otpInput: {
        width: '55px',
        height: '55px',
        fontSize: '24px',
        fontWeight: '600',
        textAlign: 'center',
        border: '2px solid #d0d0d0',
        borderRadius: '8px',
        outline: 'none',
        transition: 'all 0.3s ease',
        color: '#333333',
        backgroundColor: '#ffffff'
    },
    otpInputError: {
        borderColor: '#e74c3c',
        animation: 'shake 0.3s ease'
    },
    otpInputDisabled: {
        opacity: 0.6,
        cursor: 'not-allowed'
    },
    errorMessage: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        backgroundColor: '#ffe6e6',
        color: '#e74c3c',
        padding: '12px 16px',
        borderRadius: '6px',
        fontSize: '14px',
        marginBottom: '20px',
        border: '1px solid #ffcccc'
    },
    errorIcon: {
        fontSize: '16px',
        fontWeight: 'bold'
    },
    submitBtn: {
        width: '100%',
        padding: '14px 20px',
        backgroundColor: '#6b4c9a',
        color: '#ffffff',
        border: 'none',
        borderRadius: '4px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        marginBottom: '20px'
    },
    submitBtnDisabled: {
        backgroundColor: '#9a8bb4',
        cursor: 'not-allowed'
    },
    resendContainer: {
        fontSize: '14px'
    },
    resendText: {
        color: '#666666'
    },
    resendLink: {
        color: '#3498db',
        textDecoration: 'none',
        fontWeight: '500',
        transition: 'color 0.3s ease'
    }
};

export default OTP;