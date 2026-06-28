import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Background from "../../common/Background";
import { MerchantLogin } from "../../../assets/image";
import BusinessInfoForm from "./forms/BusinessInfoForm/BusinessInfoForm";
import LegalInfoForm from "./forms/LegalInfoForm/LegalInfoForm";
import LocationInfoForm from "./forms/LocationInfo/LocationInfo";
import ContactInfo from "./forms/ContactInfo/ContactInfo";
import Terms from "./forms/Terms/Terms";
import Congratulation from "./forms/Congratulation/Congratulation";
import { useTranslation } from "react-i18next";
import { completeMerchantProfile } from "../../../store/slices/merchantsuser";
import { uploadImage } from "../../../helper/helper";
import "./CompleteProfile.css";
import { showToast } from "../../CustomToast/CustomToast";
import { logout } from "../../../store/slices/authSlice";

const CompleteProfile = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    terms: {},
    businessInfo: {},
    legalInfo: {},
    locationInfo: {},
    contactInfo: {},
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const tabs = [
    { id: 0, label: t("merchant.completeProfile.tabs.terms") },
    { id: 1, label: t("merchant.completeProfile.tabs.businessInfo") },
    { id: 2, label: t("merchant.completeProfile.tabs.legalInfo") },
    { id: 3, label: t("merchant.completeProfile.tabs.locationInfo") },
    { id: 4, label: t("merchant.completeProfile.tabs.contactInfo") },
  ];

  const handleNext = () => {
    setActiveTab((prev) => (prev < 5 ? prev + 1 : prev));
  };

  const handleBack = () => {
    setActiveTab((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const saveFormData = (step, data) => {
    setFormData((prev) => ({
      ...prev,
      [step]: data,
    }));
  };

  // Helper function to upload files and get attachment IDs
  const uploadFiles = async (files) => {
    const uploadedFiles = [];

    for (const file of files) {
      if (file && file.file) {
        try {
          console.log("Uploading file:", file);
          const result = await uploadImage(file.file);
          console.log("Upload result:", result);
          uploadedFiles.push({
            ...file,
            attachmentId: result?.result?.id,
          });
        } catch (error) {
          console.error("Failed to upload file:", error);
          throw new Error(`Failed to upload ${file.documentType || "file"}`);
        }
      }
    }

    return uploadedFiles;
  };

  // Transform form data to match backend format
  const transformDataForBackend = (data, uploadedDocs) => {
    const { businessInfo, legalInfo, locationInfo, contactInfo } = data;

    // Calculate years in operation from start date
    const calculateYearsInOperation = (year) => {
      if (!year) return 0;
      return new Date().getFullYear() - parseInt(year);
    };

    // Format date as YYYY-MM-DD
    const formatDate = (day, month, year) => {
      if (!day || !month || !year) return null;
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
        2,
        "0"
      )}`;
    };

    const payload = {
      businessInfo: {
        legalName: businessInfo.businessLegalName || "",
        tradeName: businessInfo.businessTradeName || "",
        businessTypeId: businessInfo.businessType || "",
        tradeLicenseNo: legalInfo.tradeLicenseNumber || "",
        taxId: legalInfo.taxId || "",
        industryId: businessInfo.businessIndustry || "",
        yearsInOperation: calculateYearsInOperation(businessInfo.startYear),
        employeesCount: parseInt(businessInfo.numberOfEmployees) || 0,
        status: "PENDING",
        merchantType: businessInfo.merchantType || "SEGMENT",
        businessStartedDate: formatDate(
          businessInfo.startDay,
          businessInfo.startMonth,
          businessInfo.startYear
        ),
        licenseExpiryDate: formatDate(
          legalInfo.expiryDay,
          legalInfo.expiryMonth,
          legalInfo.expiryYear
        ),
      },
      addresses:
        locationInfo.locations?.map((location) => ({
          type: "REGISTERED",
          countryId: location.country || "",
          cityId: location.city || "",
          address: location.fullAddress || "",
        })) || [],
      contactInfo: {
        title: contactInfo.userTitle || "",
        name: contactInfo.fullName || "",
        email: contactInfo.businessEmail || "",
        secondEmail: contactInfo.secondBusinessEmail || null,
        thirdEmail: contactInfo.thirdBusinessEmail || null,
        phone: contactInfo.businessPhone || "",
        secondPhone: contactInfo.secondBusinessPhone || null,
        thirdPhone: contactInfo.thirdBusinessPhone || null,
      },
      policy: {
        policyId: "122423",
        version: "1.0",
      },
    };

    // Add documents if any were uploaded
    if (uploadedDocs && uploadedDocs.length > 0) {
      payload.documents = uploadedDocs.map((doc) => ({
        documentId: doc.documentType || "DOC-001",
        attachmentId: doc.attachmentId,
        expiryDate: doc.expiryDate || "2031-03-03",
        verificationStatus: "PENDING",
      }));
    }

    return payload;
  };

  const handleFinalSubmit = async (finalData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const completeData = {
        ...formData,
        contactInfo: finalData,
      };

      // Collect all files to upload
      const filesToUpload = [];

      if (completeData.legalInfo.businessLicenseFile) {
        console.log(
          "ompleteData.legalInfo.businessLicenseFile,",
          completeData.legalInfo.businessLicenseFile
        );
        filesToUpload.push({
          file: completeData.legalInfo.businessLicenseFile,
          documentType: "BUSINESS_LICENSE",
          expiryDate: transformDataForBackend(completeData, []).businessInfo
            .licenseExpiryDate,
          type: completeData.legalInfo.businessLicenseFile.type,
        });
      }

      if (completeData.legalInfo.businessFile1) {
        filesToUpload.push({
          file: completeData.legalInfo.businessFile1,
          documentType: "ADDITIONAL_DOC_1",
          type: completeData.legalInfo.businessFile1.type,
        });
      }

      if (completeData.legalInfo.businessFile2) {
        filesToUpload.push({
          file: completeData.legalInfo.businessFile2,
          documentType: "ADDITIONAL_DOC_2",
          type: completeData.legalInfo.businessFile2.type,
        });
      }
      console.log("Files to upload:", filesToUpload);
      // Upload all files and get attachment IDs
      const uploadedDocs =
        filesToUpload.length > 0 ? await uploadFiles(filesToUpload) : [];

      // Transform data to match backend format
      const profileData = transformDataForBackend(completeData, uploadedDocs);

      await dispatch(completeMerchantProfile({ profileData })).unwrap();
      showToast.success("Profile completed successfully");
      navigate("/merchant/dashboard/home");

    } catch (error) {
      console.error("Failed to complete profile:", error);
      const errorMessage =
        error.message || "Failed to submit profile. Please try again.";
      setSubmitError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <Terms
            onNext={(data) => {
              saveFormData("terms", data);
              handleNext();
            }}
            onBack={handleBack}
            initialData={formData.terms}
          />
        );
      case 1:
        return (
          <BusinessInfoForm
            onNext={(data) => {
              saveFormData("businessInfo", data);
              handleNext();
            }}
            onBack={handleBack}
            initialData={formData.businessInfo}
          />
        );
      case 2:
        return (
          <LegalInfoForm
            onNext={(data) => {
              saveFormData("legalInfo", data);
              handleNext();
            }}
            onBack={handleBack}
            initialData={formData.legalInfo}
          />
        );
      case 3:
        return (
          <LocationInfoForm
            onNext={(data) => {
              saveFormData("locationInfo", data);
              handleNext();
            }}
            onBack={handleBack}
            initialData={formData.locationInfo}
          />
        );
      case 4:
        return (
          <ContactInfo
            onSubmit={handleFinalSubmit}
            onBack={handleBack}
            initialData={formData.contactInfo}
            isSubmitting={isSubmitting}
            error={submitError}
          />
        );
      case 5:
        return <Congratulation />;
      default:
        return null;
    }
  };
  const handleLogout = () => {
        dispatch(logout());
        window.dispatchEvent(new Event('authStateChanged'));
        navigate("/signin");
        showToast.success(t("logged out successfully"));
  }

  return (
    <>
      <Background
        title={t("merchant.completeProfile.backgroundTitle")}
        description={t("merchant.completeProfile.backgroundDescription")}
        image={MerchantLogin}
      />
      <div className="complete-profile-wrapper">
        <div className="complete-profile-container">
          <div className="complete-profile-content">
            {activeTab !== 5 && (
              <button
                className="back-to-login"
                onClick={handleLogout}
              >
                {t("merchant.completeProfile.backToLogin")}
              </button>
            )}
            {activeTab !== 5 && (
              <div className="profile-header">
                <h1 className="profile-title">
                  {t("merchant.completeProfile.title")}
                </h1>
                <p className="profile-subtitle">
                  {t("merchant.completeProfile.subtitle")}
                </p>
              </div>
            )}

            {activeTab !== 5 && (
              <div className="profile-tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`tab-button ${
                      activeTab === tab.id ? "active" : ""
                    } ${activeTab > tab.id ? "completed" : ""}`}
                    onClick={() => setActiveTab(tab.id)}
                    disabled={activeTab < tab.id}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            <div className="profile-form-container">{renderTabContent()}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompleteProfile;
