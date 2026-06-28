import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {Checked} from '../../../assets/icons'
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ForgetPasswordLayout from './ForgetPasswordLayout';
import {HomeBanner} from '../../../assets/image'
import './ForegetPassord.css';

const ForgetStep4 = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Optional: Auto-redirect to login after a few seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      // navigate('/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleBackToLogin = () => {
    navigate('/admin');
  };

  return (
    <ForgetPasswordLayout
      backgroundImage={HomeBanner}
      title={t('forgetStep4.backgroundTitle', 'Ready To Lead The Region?')}
      subtitle={t(
        'forgetStep4.backgroundSubtitle',
        "Let's Keep Our Core Values Of Trust, Quality, And Accessibility At The Heart Of Every Decision."
      )}
      fullOverlay={true}
      showLanguageToggle={false}
      showCopyright={false}
      t={t}
    >
      <div className="success-container">
        <div className="success-icon">
          <Checked />
        </div>
        
        <h1 className="success-title">
          {t('forgetStep4.title', 'Password Changed!')}
        </h1>
        
        <p className="success-message">
          {t(
            'forgetStep4.message',
            'Password changed successfully, you can login again with a new password'
          )}
        </p>

        <button
          type="button"
          className="form-button form-button-primary"
          onClick={handleBackToLogin}
          style={{ marginTop: '32px' }}
        >
          {t('forgetStep4.loginButton', 'Back to Login')}
        </button>

        {/* <div className="form-footer" style={{ marginTop: '40px' }}>
          {t('forgetStep4.copyright', '© Copyright SAWA 2026. All right reserved')}
        </div> */}
      </div>
    </ForgetPasswordLayout>
  );
};

export default ForgetStep4;