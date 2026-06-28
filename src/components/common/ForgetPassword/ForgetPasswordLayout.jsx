import React from 'react';
import { useTranslation } from 'react-i18next';
import './ForgetPasswordLayout.css';

const ForgetPasswordLayout = ({ 
  children, 
  backgroundImage, 
  title, 
  subtitle,
  fullOverlay = false,
  showLanguageToggle = true,
  showCopyright = true,
  t
}) => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };
  

  return (
    <div className="forget-password-layout" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="forget-password-container">
   
        <div className="forget-password-background">
          <img 
            src={backgroundImage} 
            alt="Background" 
            className="background-image"
          />
          
          {fullOverlay && <div className="background-overlay-full" />}
          
          
            <div className="background-content">
              {!fullOverlay && <div className="background-overlay" />}
              <div className="background-text">
                <h1 className="background-title">{title}</h1>
                <p className="background-subtitle">{subtitle}</p>
              </div>
            </div>
        
        </div>

        {/* Form Section */}
        <div className="forget-password-form-container">
          <div className="forget-password-form">
            {showLanguageToggle && (
              <button 
                onClick={toggleLanguage}
                className="language-toggle"
                aria-label="Toggle Language"
              >
                {i18n.language === 'en' ? 'العربية' : 'English'}
              </button>
            )}
            {children}
          </div>
          {showCopyright && (
            <span className='copyright-forget'>{t('forgetPassword.copyright')}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgetPasswordLayout;