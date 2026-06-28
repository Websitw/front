import React, { useState, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import { showToast } from "../../../../components/CustomToast/CustomToast";
import FormFileUpload from "../../../../components/common/FormFileUpload";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FormSelect from "../../../../components/common/FormSelect";
import FormInput from "../../../../components/common/FormInput";
import CountrySelect from "../../../../components/common/CountrySelect";
import { fetchCountriesListAnonymous } from "../../../../store/slices/counteriesSlice";
import { useDispatch, useSelector } from "react-redux";
import FormPhoneInput from "../../../../components/common/FormPhoneInput";
import { fetchIndustries } from "../../../../store/slices/industriesSlice";
import {
  updateCompany,
  getCompany,
} from "../../../../store/slices/companySlice";
import { businessAccountSchema } from "../../../../components/Schemas/BusinessAccountSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { uploadImage, imageUrl } from "../../../../helper/helper";

const EditNameModal = ({
  isOpen,
  onClose,
  userData,
  onSave,
  checkCompanyStatus,
}) => {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isImageRemoved, setIsImageRemoved] = useState(false);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { allCountriesList } = useSelector((state) => state.countries);
  const { items } = useSelector((state) => state.industries);

  const validCountries = allCountriesList.filter(
    (country) =>
      country.countryCodeNumeric !== undefined &&
      country.countryCodeNumeric !== null,
  );
  console.log("validCountries", validCountries);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(businessAccountSchema),
    defaultValues: {
      companyName: "",
      commercialName: "",
      businessEmail: "",
      establishmentNumber: "",
      businessPhone: "",
      countryId: "",
      industryId: "",
      taxId: "",
      logoId: null,
      businessLicenseFile: null,
      businessStartedDate: {
        day: "",
        month: "",
        year: "",
      },
      agreedToTerms: false,
    },
  });

  useEffect(() => {
    dispatch(fetchCountriesListAnonymous());
    dispatch(fetchIndustries());
    dispatch(getCompany(userData?.id))
      .unwrap()
      .then((result) => {
        console.log("company data in edit modal", result);
      });
  }, [dispatch]);

  console.log("userData in edit modal", userData);

  useEffect(() => {
    if (userData && isOpen) {
      setValue("companyName", userData.companyName || "");
      setValue("commercialName", userData.commercialName || "");
      setValue("businessEmail", userData.businessEmail || "");
      setValue("establishmentNumber", userData.establishmentNo || "");
      setValue("businessPhone", userData.businessPhone || "");
      setValue("countryId", userData.countryId?.id || "");
      setValue("industryId", userData.industry?.id || "");
      setValue("taxId", userData.taxId || "");
      setValue("logoId", userData.logoId || null);
      setValue("agreedToTerms", false);
      setIsImageRemoved(false);

      if (userData.businessStartedDate) {
        const date = new Date(userData.businessStartedDate);
        setValue("businessStartedDate.day", date.getDate().toString() || "");
        setValue(
          "businessStartedDate.month",
          (date.getMonth() + 1).toString() || "",
        );
        setValue(
          "businessStartedDate.year",
          date.getFullYear().toString() || "",
        );
      }
    }
  }, [userData, isOpen, setValue]);

  const businessLicenseFile = watch("businessLicenseFile");

  useEffect(() => {
    if (businessLicenseFile instanceof File) {
      const previewUrl = URL.createObjectURL(businessLicenseFile);
      setImagePreview(previewUrl);

      return () => {
        URL.revokeObjectURL(previewUrl);
      };
    } else {
      setImagePreview(null);
    }
  }, [businessLicenseFile]);

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      let logoId = data.logoId;

      if (data.businessLicenseFile instanceof File) {
        const uploadResult = await uploadImage(data.businessLicenseFile);
        logoId = uploadResult?.result?.id;
      }

      const companyData = {
        companyName: data.companyName,
        commercialName: data.commercialName,
        businessEmail: data.businessEmail,
        establishmentNo: data.establishmentNumber,
        businessPhone: data.businessPhone,
        countryId: data.countryId,
        industryId: data.industryId,
        taxId: data.taxId,
        logoId: logoId,
        businessStartedDate: `${data.businessStartedDate.year}-${data.businessStartedDate.month.padStart(2, "0")}-${data.businessStartedDate.day.padStart(2, "0")}`,
        status: userData?.status || "Pending",
        commercialImageId: logoId,
      };

      await dispatch(
        updateCompany({ id: userData?.id, data: companyData }),
      ).unwrap();
      await checkCompanyStatus();
      reset();
      showToast.success("Business Info Updated successfully");
      if (onSave) {
        onSave(companyData);
      }
      onClose();
    } catch (error) {
      console.error("Update failed", error);
      showToast.error(error.message || "Failed to update. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const days = Array.from({ length: 31 }, (_, i) => ({
    value: String(i + 1),
    label: String(i + 1),
  }));

  const months = [
    { value: "1", label: t("merchant.completeProfile.months.january") },
    { value: "2", label: t("merchant.completeProfile.months.february") },
    { value: "3", label: t("merchant.completeProfile.months.march") },
    { value: "4", label: t("merchant.completeProfile.months.april") },
    { value: "5", label: t("merchant.completeProfile.months.may") },
    { value: "6", label: t("merchant.completeProfile.months.june") },
    { value: "7", label: t("merchant.completeProfile.months.july") },
    { value: "8", label: t("merchant.completeProfile.months.august") },
    { value: "9", label: t("merchant.completeProfile.months.september") },
    { value: "10", label: t("merchant.completeProfile.months.october") },
    { value: "11", label: t("merchant.completeProfile.months.november") },
    { value: "12", label: t("merchant.completeProfile.months.december") },
  ];

  const handleRemoveImage = () => {
    setValue("logoId", null);
    setValue("businessLicenseFile", null);
    setImagePreview(null);
    setIsImageRemoved(true);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => ({
    value: String(currentYear - i),
    label: String(currentYear - i),
  }));

  console.log("errors", errors);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Business Info</h3>
          <X className="close-icon" onClick={onClose} />
        </div>

        <div className="modal-body completeScrollable">
          <div className="modal-field">
            <FormInput
              label={"Company Name"}
              name="companyName"
              type="text"
              placeholder={"Company Name"}
              required
              bgColor="var(--color-white)"
              variant="bordered"
              control={control}
              styleLabel={{ marginBottom: "0px" }}
              error={
                errors.companyName?.message ? t(errors.companyName.message) : ""
              }
            />
          </div>

          <div className="modal-field">
            <FormInput
              label={"Commercial Name"}
              name="commercialName"
              type="text"
              placeholder={"Commercial Name"}
              required
              bgColor="var(--color-white)"
              variant="bordered"
              control={control}
              styleLabel={{ marginBottom: "0px" }}
              error={
                errors.commercialName?.message
                  ? t(errors.commercialName.message)
                  : ""
              }
            />
          </div>

          {/* <div className="modal-field">
            <div className="form-group">
              <FormInput
                label={"Business Email"}
                name="businessEmail"
                type="email"
                placeholder={"Business Email"}
                required
                bgColor="var(--color-white)"
                variant="bordered"
                control={control}
                styleLabel={{ marginBottom: "0px" }}
                error={
                  errors.businessEmail?.message
                    ? t(errors.businessEmail.message)
                    : ""
                }
              />
            </div>
          </div> */}

          <div className="modal-field">
            <FormInput
              label={"Establishment Number"}
              name="establishmentNumber"
              type="text"
              placeholder={"Establishment Number"}
              bgColor="var(--color-white)"
              variant="bordered"
              control={control}
              styleLabel={{ marginBottom: "0px" }}
              error={
                errors.establishmentNumber?.message
                  ? t(errors.establishmentNumber.message)
                  : ""
              }
            />
          </div>

          <div className="modal-field">
            <FormPhoneInput
              label={t("user.form.phoneNumber")}
              name="businessPhone"
              placeholder={t("user.form.phoneNumberPlaceholder")}
              control={control}
              error={t(errors.businessPhone?.message)}
              styleLabel={{ marginTop: "0px", marginBottom: "0px" }}
              bgColor="var(--color-white)"
            />
          </div>

          <div className="modal-field">
            <div className="select-wrapper">
              <CountrySelect
                label={"Business Country"}
                name="countryId"
                control={control}
                error={t(errors.countryId?.message)}
                bgColor="var(--color-white)"
                valueKey={"id"}
                variant="bordered"
                options={validCountries}
                styleLabel={{ marginBottom: "6px", marginTop: "0px" }}
              />
            </div>
          </div>

          <div className="modal-field">
            <FormSelect
              label={"Business Industry"}
              name="industryId"
              placeholder={"Select Business Industry"}
              options={items.map((industry) => ({
                value: industry.id,
                label: industry.name,
              }))}
              control={control}
              error={t(errors.industryId?.message)}
              bgColor="var(--color-white)"
              variant="bordered"
              styleLabel={{ marginBottom: "0px" }}
            />
          </div>

          <div className="modal-field">
            <FormInput
              label={"Tax ID"}
              name="taxId"
              type="text"
              placeholder={"Tax ID"}
              bgColor="var(--color-white)"
              variant="bordered"
              control={control}
              styleLabel={{ marginBottom: "0px" }}
              error={errors.taxId?.message ? t(errors.taxId.message) : ""}
            />
          </div>

          <div className="modal-field">
            <label>
              Upload Business license File{" "}
              <span style={{ color: "red" }}>*</span>
            </label>
            <FormFileUpload
              name="businessLicenseFile"
              placeholder={t(
                "merchant.completeProfile.placeholders.businessLicenseFile",
              )}
              control={control}
              variant="bordered"
              bgColor="var(--color-primary-background)"
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <span className="note-formats">
              Note: Image Formats Allowed: JPG, JPEG, PNG
            </span>
            {errors.businessLicenseFile && (
              <span
                style={{
                  color: "red",
                  fontSize: "12px",
                  marginTop: "5px",
                  display: "block",
                }}
              >
                {t(errors.businessLicenseFile.message)}
              </span>
            )}
            {(imagePreview || (userData?.logoId && !isImageRemoved)) && (
              <div
                style={{
                  marginTop: "10px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                  position: "relative",
                }}
              >
                <div style={{ position: "relative", display: "inline-block" }}>
                  <img
                    src={
                      imagePreview ||
                      (userData?.logoId ? `${imageUrl}${userData.logoId}` : "")
                    }
                    alt="Preview"
                    style={{
                      maxWidth: "200px",
                      maxHeight: "200px",
                      borderRadius: "8px",
                      objectFit: "contain",
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      background: "var(--color-error, #ff4444)",
                      border: "none",
                      borderRadius: "50%",
                      width: "28px",
                      height: "28px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    }}
                  >
                    <X size={16} color="white" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="modal-field">
            <label>
              Business Started Date{" "}
              <span className="optional-text">(optional)</span>
            </label>
            <div className="date-select-group">
              <FormSelect
                name="businessStartedDate.day"
                placeholder={t("merchant.completeProfile.placeholders.day")}
                options={days}
                control={control}
                className="date-select"
                variant="bordered"
                bgColor="var(--color-white)"
                styleLabel={{ marginTop: "0px", marginBottom: "0px" }}
              />
              <FormSelect
                name="businessStartedDate.month"
                placeholder={t("merchant.completeProfile.placeholders.month")}
                options={months}
                control={control}
                className="date-select"
                variant="bordered"
                bgColor="var(--color-white)"
                styleLabel={{ marginBottom: "0px" }}
              />
              <FormSelect
                name="businessStartedDate.year"
                placeholder={t("merchant.completeProfile.placeholders.year")}
                options={years}
                control={control}
                className="date-select"
                variant="bordered"
                bgColor="var(--color-white)"
                styleLabel={{ marginBottom: "0px" }}
              />
            </div>
          </div>

          <div className="modal-field">
            <div className="edit-terms-sections">
              <input type="checkbox" {...control.register("agreedToTerms")} />
              <p>
                By ticking, you are confirming that you have read and agree to
                SAWA <span className="edite-terms">terms and conditions.</span>
              </p>
            </div>
            {errors.agreedToTerms && (
              <span
                style={{
                  color: "red",
                  fontSize: "12px",
                  marginTop: "5px",
                  marginBottom: "10px",
                  display: "block",
                }}
              >
                {t(errors.agreedToTerms.message)}
              </span>
            )}
            <div className="edit-terms-sections" style={{ marginTop: "20px" }}>
              <input type="checkbox" />
              <p>
                <span className="edit-note">Note:</span> Modifying and
                reassessing your Business account takes 1-3 business days.
                Trading transactions are suspended until the account is
                reconfirmed.
              </p>
            </div>
          </div>

          <button
            className={`save-btn ${isSubmitting ? "submitting" : ""}`}
            onClick={handleSubmit(onSubmit)}
            disabled={loading || isSubmitting}
          >
            {loading || isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditNameModal;
