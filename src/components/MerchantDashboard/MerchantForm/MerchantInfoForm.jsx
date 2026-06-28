import React, { useState, useEffect } from 'react';
import { Form, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Check, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FormInput from '../../common/FormInput';
import FormMultiSelect from '../../common/FormMultiSelect';
import FormFileUpload from '../../common/FormFileUpload';
import FormCheckbox from '../../common/Formcheckbox';

import './MerchantInfoForm.css';

// Define validation schema for step 1 using zod
const step1Schema = z.object({
  merchantName: z.string().min(1, 'merchantNameRequired'),
  commercialName: z.string().optional(),
  registrationNumber: z.string().min(6, 'registrationNumberMin'),
  fieldOfInterest: z.array(z.object({
    value: z.string(),
    label: z.string()
  })).min(1, 'fieldOfInterestRequired'),
  countries: z.array(z.object({
    value: z.string(),
    label: z.string()
  })).min(1, 'countriesRequired'),
  logo: z.object({
    file: z.any(),
    preview: z.string()
  }).optional()
});

// Main component for Merchant Info Form
const MerchantInfoForm = () => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState(null);
  const [step2Data, setStep2Data] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
 // Initialize react-hook-form for step 1
  const { control: control1, handleSubmit: handleSubmit1, formState: { errors: errors1 }, watch, setValue } = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      merchantName: '',
      commercialName: '',
      registrationNumber: '',
      fieldOfInterest: [],
      countries: [],
      logo: null,
      byBrand: false,
      byCategory: false
    }
  });
 // Watch the values of byBrand and byCategory checkboxes
  const byBrand = watch('byBrand');
  const byCategory = watch('byCategory');
// Ensure only one of byBrand or byCategory can be selected at a time
  useEffect(() => {
    if (byBrand) {
      setValue('byCategory', false);
    }
  }, [byBrand, setValue]);
// Ensure only one of byBrand or byCategory can be selected at a time
  useEffect(() => {
    if (byCategory) {
      setValue('byBrand', false);
    }
  }, [byCategory, setValue]);

  // Function to create dynamic validation schema for step 2 based on selected countries
  const createStep2Schema = (countries) => {
    const documentsSchema = {};
    // For each selected country, add document fields to the schema
    countries.forEach(country => {
      documentsSchema[`${country.value}_commercialRegistration`] = z.object({
        file: z.any(),
        preview: z.string()
      }).optional();
      documentsSchema[`${country.value}_taxId`] = z.object({
        file: z.any(),
        preview: z.string()
      }).optional();
      documentsSchema[`${country.value}_businessPlan`] = z.object({
        file: z.any(),
        preview: z.string()
      }).optional();
      documentsSchema[`${country.value}_businessLicense`] = z.object({
        file: z.any(),
        preview: z.string()
      }).optional();
    });
    return z.object(documentsSchema);
  };
// Initialize react-hook-form for step 2 with dynamic schema
  const { control: control2, handleSubmit: handleSubmit2, formState: { errors: errors2 } } = useForm({
    resolver: step1Data ? zodResolver(createStep2Schema(step1Data.countries)) : undefined
  });



  const fieldOfInterestOptions = [
    { value: 'electronics', label: t('merchant.form.electronics') || 'Electronics' },
    { value: 'fashion', label: t('merchant.form.fashion') || 'Fashion' },
    { value: 'food', label: t('merchant.form.food') || 'Food & Beverage' },
    { value: 'makeup', label: t('merchant.form.makeup') || 'Makeup' },
    { value: 'furniture', label: t('merchant.form.furniture') || 'Furniture' },
    { value: 'sports', label: t('merchant.form.sports') || 'Sports' }
  ];

  const countryOptions = [
    { value: 'jordan', label: t('merchant.form.jordan') || 'Jordan' },
    { value: 'saudi', label: t('merchant.form.saudi') || 'Saudi Arabia' },
    { value: 'uae', label: t('merchant.form.uae') || 'UAE' },
    { value: 'egypt', label: t('merchant.form.egypt') || 'Egypt' },
    { value: 'kuwait', label: t('merchant.form.kuwait') || 'Kuwait' }
  ];

  const onStep1Submit = (data) => {
    setStep1Data(data);
    setCurrentStep(2);
  };

  const onStep2Submit = (data) => {
    setStep2Data(data);
    setCurrentStep(3);
  };

  const handleFinalSubmit = () => {
    if (!termsAccepted) {
      alert(t('acceptTerms') || 'Please accept terms and conditions');
      return;
    }

    const finalData = {
      ...step1Data,
      documents: step2Data
    };

    console.log('Final submission:', finalData);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    if (window.confirm(t('confirmReset') || 'Are you sure you want to reset the form?')) {
      setCurrentStep(1);
      setStep1Data(null);
      setStep2Data(null);
      setTermsAccepted(false);
    }
  };

  const steps = [
    { number: 1, label: t('merchant.form.profileData') || 'Profile Data' },
    { number: 2, label: t('merchant.form.selectedCountriesRequirements') || 'Selected Countries Requirements' },
    { number: 3, label: t('merchant.form.submit') || 'Submit' }
  ];

  const renderStepper = () => (
    <div className="merchant-stepper">
      {steps.map((step) => (
        <div key={step.number} className="merchant-step">
          <div className={`merchant-step-circle ${currentStep >= step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}>
            {step.number}
          </div>
          <span className={`merchant-step-label ${currentStep >= step.number ? 'active' : ''}`}>
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
// Render form for step 1

  const renderStep1 = () => (
    <form onSubmit={handleSubmit1(onStep1Submit)}>
      <div className="merchant-form-section">
        <h2 className="merchant-section-title">{t('merchant.form.merchantInfo') || 'Merchant Info'}</h2>
        <div className="merchant-form-grid">
          <FormInput
            label={t('merchant.form.merchantName') || 'Merchant Name'}
            name="merchantName"
            control={control1}
            required
            placeholder={t('merchant.form.enterMerchantName') || 'Enter merchant name'}
            error={errors1.merchantName?.message ? t(errors1.merchantName.message) : ''}
          />
          <FormInput
            label={t('merchant.form.commercialName') || 'Commercial Name'}
            name="commercialName"
            control={control1}
            placeholder={t('merchant.form.enterCommercialName') || 'Enter commercial name'}
            error={errors1.commercialName?.message ? t(errors1.commercialName.message) : ''}
          />
          <FormInput
            label={t('merchant.form.registrationNumber') || 'Registration Number'}
            name="registrationNumber"
            control={control1}
            required
            placeholder={t('merchant.form.minimumNumbers', { count: 6 }) || 'Minimum 6 numbers'}
            error={errors1.registrationNumber?.message ? t(errors1.registrationNumber.message) : ''}
          />
          <FormMultiSelect
            label={t('merchant.form.fieldOfInterest') || 'Field of Interest'}
            name="fieldOfInterest"
            control={control1}
            required
            multiple={true}
            options={fieldOfInterestOptions}
            placeholder={t('merchant.form.selectFieldsOfInterest') || 'Select fields of interest'}
            error={errors1.fieldOfInterest?.message ? t(errors1.fieldOfInterest.message) : ''}
          />
            <FormMultiSelect
              label={t('merchant.form.countries') || 'Countries'}
              name="countries"
              control={control1}
              required
              multiple={true}
              options={countryOptions}
              placeholder={t('merchant.form.selectCountries') || 'Select countries'}
              error={errors1.countries?.message ? t(errors1.countries.message) : ''}
            />
            <div className="merchant-form-checkbox-group">
              <FormCheckbox 
                label={t('merchant.form.ByBrand') }
                name="byBrand"
                control={control1}
              />
              <FormCheckbox
               label={t('merchant.form.ByCategory')}
                name="byCategory"
                control={control1}
              />

            </div>
          <div className="merchant-form-full-width">
            <FormFileUpload
              label={t('merchant.form.logoImage') || 'Logo image:'}
              name="logo"
              control={control1}
              accept="image/*"
              maxSize={5}
              uploadText={t('merchant.form.uploadLogoText') || 'Click to upload or drag and drop'}
              fileTypeText={t('merchant.form.supportedFormats') || 'PNG, JPG, GIF up to 5MB'}
              maxSizeText={t('merchant.form.maxSize', { size: '5MB' }) || 'Maximum file size: 5MB'}
              error={errors1.logo?.message ? t(errors1.logo.message) : ''}
            />
          </div>
        </div>
      </div>
      <div className="merchant-form-actions">
        <button type="submit" className="merchant-btn merchant-btn-next">
          {t('next') || 'Next'}
        </button>
      </div>
    </form>
  );

  // Render form for step 2
  const renderStep2 = () => {
    if (!step1Data) return null;

    return (
      <form onSubmit={handleSubmit2(onStep2Submit)}>
        <div className="merchant-requirements-section">
          <h2 className="merchant-section-title">{t('merchant.form.requirements') || 'Requirements'}</h2>
          <h3 className="merchant-requirements-title">
            {t('merchant.form.requiredDocuments') || 'Required documents for'} [{step1Data.countries.map(c => c.label).join(', ')}]
          </h3>

          {step1Data.countries.map((country) => (
            <div key={country.value} className="merchant-country-documents">
              <h4 className="merchant-country-title">{country.label}</h4>
              <div className="merchant-documents-grid">
                <FormFileUpload
                  label={t('merchant.form.commercialRegistration') || 'Commercial registration:'}
                  name={`${country.value}_commercialRegistration`}
                  control={control2}
                  accept="image/*"
                  maxSize={5}
                  uploadText={t('merchant.form.uploadDocument') || 'Upload document'}
                  fileTypeText={t('merchant.form.supportedFormats') || 'PNG, JPG, PDF'}
                  error={errors2[`${country.value}_commercialRegistration`]?.message}
                />
                <FormFileUpload
                  label={t('merchant.form.taxId') || 'Tax ID image:'}
                  name={`${country.value}_taxId`}
                  control={control2}
                  accept="image/*"
                  maxSize={5}
                  uploadText={t('merchant.form.uploadDocument') || 'Upload document'}
                  fileTypeText={t('merchant.form.supportedFormats') || 'PNG, JPG, PDF'}
                  error={errors2[`${country.value}_taxId`]?.message}
                />
                <FormFileUpload
                  label={t('merchant.form.businessPlan') || 'Business Plan:'}
                  name={`${country.value}_businessPlan`}
                  control={control2}
                  accept="image/*"
                  maxSize={5}
                  uploadText={t('merchant.form.uploadDocument') || 'Upload document'}
                  fileTypeText={t('merchant.form.supportedFormats') || 'PNG, JPG, PDF'}
                  error={errors2[`${country.value}_businessPlan`]?.message}
                />
                <FormFileUpload
                  label={t('merchant.form.businessLicense') || 'Business License:'}
                  name={`${country.value}_businessLicense`}
                  control={control2}
                  accept="image/*"
                  maxSize={5}
                  uploadText={t('merchant.form.uploadDocument') || 'Upload document'}
                  fileTypeText={t('merchant.form.supportedFormats') || 'PNG, JPG, PDF'}
                  error={errors2[`${country.value}_businessLicense`]?.message}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="merchant-form-actions">
          <button type="button" onClick={handleBack} className="merchant-btn merchant-btn-back">
            <ArrowLeft size={18} />
            {t('merchant.form.back') || 'Back'}
          </button>
          <button type="submit" className="merchant-btn merchant-btn-next">
            {t('merchant.form.saveChanges') || 'Save changes'}
            <Check size={18} />
          </button>
        </div>
      </form>
    );
  };
// Render summary and submission for step 3
  const renderStep3 = () => {
    if (!step1Data || !step2Data) return null;

    return (
      <div className="merchant-summary-section">
        <h2 className="merchant-section-title">{t('merchant.form.submitForm') || 'Submit form'}</h2>

        <div className="merchant-summary-card">
          <h3 className="merchant-summary-header">{t('merchant.form.basicInformation') || 'Basic information'}</h3>
          <div className="merchant-summary-grid">
            <div className="merchant-summary-field">
              <span className="merchant-summary-label">{t('merchant.form.name') || 'Name'}</span>
              <span className="merchant-summary-value">{step1Data.merchantName}</span>
            </div>
            <div className="merchant-summary-field">
              <span className="merchant-summary-label">{t('merchant.form.commercialName') || 'Commercial Name'}</span>
              <span className="merchant-summary-value">{step1Data.commercialName || '-'}</span>
            </div>
            <div className="merchant-summary-field">
              <span className="merchant-summary-label">{t('merchant.form.registrationNumber') || 'Registration Number'}</span>
              <span className="merchant-summary-value">{step1Data.registrationNumber}</span>
            </div>
          </div>
        </div>

        <div className="merchant-summary-card">
          <h3 className="merchant-summary-header">{t('merchant.form.fieldsOfInterest') || 'Fields of Interest'}</h3>
          <div className="merchant-summary-tags">
            {step1Data.fieldOfInterest.map((field) => (
              <span key={field.value} className="merchant-summary-tag">
                {field.label}
              </span>
            ))}
          </div>
        </div>

        <div className="merchant-summary-card">
          <h3 className="merchant-summary-header">{t('merchant.form.operatingCountries') || 'Operating Countries'}</h3>
          <div className="merchant-summary-tags">
            {step1Data.countries.map((country) => (
              <span key={country.value} className="merchant-summary-tag">
                {country.label}
              </span>
            ))}
          </div>
        </div>

        <div className="merchant-summary-card">
          <h3 className="merchant-summary-header">{t('merchant.form.countryDocumentation') || 'Country Documentation'}</h3>
          {step1Data.countries.map((country) => (
            <div key={country.value} style={{ marginBottom: '1.5rem' }}>
              <h4 className="merchant-country-title">{country.label}</h4>
              <div className="merchant-summary-documents">
                <div className="merchant-summary-doc">
                  <span className="merchant-summary-doc-label">{t('merchant.form.commercialRegistration') || 'Commercial Registration'}</span>
                  {step2Data[`${country.value}_commercialRegistration`]?.preview ? (
                    <img
                      src={step2Data[`${country.value}_commercialRegistration`].preview}
                      alt="Commercial Registration"
                      className="merchant-summary-doc-preview"
                    />
                  ) : (
                    <div className="merchant-summary-doc-icon">
                      <FileText size={32} />
                    </div>
                  )}
                </div>
                <div className="merchant-summary-doc">
                  <span className="merchant-summary-doc-label">{t('merchant.form.taxId') || 'Tax ID'}</span>
                  {step2Data[`${country.value}_taxId`]?.preview ? (
                    <img
                      src={step2Data[`${country.value}_taxId`].preview}
                      alt="Tax ID"
                      className="merchant-summary-doc-preview"
                    />
                  ) : (
                    <div className="merchant-summary-doc-icon">
                      <FileText size={32} />
                    </div>
                  )}
                </div>
                <div className="merchant-summary-doc">
                  <span className="merchant-summary-doc-label">{t('businessPlan') || 'Business Plan'}</span>
                  {step2Data[`${country.value}_businessPlan`]?.preview ? (
                    <img
                      src={step2Data[`${country.value}_businessPlan`].preview}
                      alt="Business Plan"
                      className="merchant-summary-doc-preview"
                    />
                  ) : (
                    <div className="merchant-summary-doc-icon">
                      <FileText size={32} />
                    </div>
                  )}
                </div>
                <div className="merchant-summary-doc">
                  <span className="merchant-summary-doc-label">{t('businessLicense') || 'Business License'}</span>
                  {step2Data[`${country.value}_businessLicense`]?.preview ? (
                    <img
                      src={step2Data[`${country.value}_businessLicense`].preview}
                      alt="Business License"
                      className="merchant-summary-doc-preview"
                    />
                  ) : (
                    <div className="merchant-summary-doc-icon">
                      <FileText size={32} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="merchant-terms">
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="merchant-terms-checkbox"
          />
          <label htmlFor="terms" className="merchant-terms-label">
            {t('merchant.form.iAcceptThe') || 'I accept the'}{' '}
            <a href="#" className="merchant-terms-link">
              {t('merchant.form.termsAndConditions') || 'terms & conditions'}
            </a>
          </label>
        </div>

        <div className="merchant-form-actions">
          <button type="button" onClick={handleReset} className="merchant-btn merchant-btn-reset">
            {t('merchant.form.resetForm') || 'Reset form'}
          </button>
          <button type="button" onClick={handleFinalSubmit} className="merchant-btn merchant-btn-submit">
            {t('merchant.form.submitAndRegister') || 'Submit & Register'}
          </button>
        </div>
      </div>
    );
  };

  return (
    // Main render
    <div className="merchant-info-form-wrapper">
    <div className="merchant-form-container">
      
      {renderStepper()}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
    </div>
    </div>
  );
};

export default MerchantInfoForm;