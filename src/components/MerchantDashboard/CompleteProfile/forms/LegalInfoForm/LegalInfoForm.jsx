import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import FormInput from "../../../../common/FormInput";
import FormSelect from "../../../../common/FormSelect";
import FormFileUpload from "../../../../common/FormFileUpload";
import { useTranslation } from "react-i18next";
import "./LegalInfoForm.css";
import FilePreview from "../../../../common/FilePreviewUpload/FilePreview";


const LegalInfoForm = ({ onNext, onBack, initialData = {} }) => {
  const { t } = useTranslation();

  const legalInfoSchema = z.object({
    tradeLicenseNumber: z
      .string()
      .min(1, t("merchant.completeProfile.validation.required"))
      .default("test"),
    expiryDay: z
      .string()
      .min(1, t("merchant.completeProfile.validation.required"))
      .default("1"),
    expiryMonth: z
      .string()
      .min(1, t("merchant.completeProfile.validation.required"))
      .default("1"),
    expiryYear: z
      .string()
      .min(1, t("merchant.completeProfile.validation.required"))
      .default(String(new Date().getFullYear())),
    taxId: z
      .string()
      .min(1, t("merchant.completeProfile.validation.required"))
      .default("test"),
    businessLicenseFile: z.any().optional(),
    businessFile1: z.any().optional(),
    businessFile2: z.any().optional(),
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(legalInfoSchema),
    defaultValues: {
      tradeLicenseNumber: initialData.tradeLicenseNumber || "",
      expiryDay: initialData.expiryDay || "",
      expiryMonth: initialData.expiryMonth || "",
      expiryYear: initialData.expiryYear || "",
      taxId: initialData.taxId || "",
      businessLicenseFile: initialData.businessLicenseFile || null,
      businessFile1: initialData.businessFile1 || null,
      businessFile2: initialData.businessFile2 || null,
    },
  });

  const onSubmit = async (data) => {
    onNext(data);
  };

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

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => ({
    value: String(currentYear + i),
    label: String(currentYear + i),
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="legal-info-form">
      <div className="completeScrollable">
      <div className="form-section">
        <h2 className="section-title">
          {t("merchant.completeProfile.sections.legalInfo")}
        </h2>

        <FormInput
          label={t("merchant.completeProfile.fields.tradeLicenseNumber")}
          name="tradeLicenseNumber"
          placeholder={t("merchant.completeProfile.placeholders.licenseNumber")}
          control={control}
          error={errors.tradeLicenseNumber?.message}
          required
          bgColor="var(--color-white)"
          variant="bordered"
          styleLabel={{ marginBottom: "0px" }}
        />

        <div>
          <label className="form-label" style={{ marginBottom: "0px" }}>
            {t("merchant.completeProfile.fields.licenseExpiryDate")}
            <span className="form-required">*</span>
          </label>
          <div className="date-select-group">
            <FormSelect
              name="expiryDay"
              placeholder={t("merchant.completeProfile.placeholders.day")}
              options={days}
              control={control}
              error={errors.expiryDay?.message}
              className="date-select"
              variant="bordered"
              bgColor="var(--color-white)"
              styleLabel={{ marginBottom: "0px" }}
            />
            <FormSelect
              name="expiryMonth"
              placeholder={t("merchant.completeProfile.placeholders.month")}
              options={months}
              control={control}
              error={errors.expiryMonth?.message}
              className="date-select"
              variant="bordered"
              bgColor="var(--color-white)"
              styleLabel={{ marginBottom: "0px" }}
            />
            <FormSelect
              name="expiryYear"
              placeholder={t("merchant.completeProfile.placeholders.year")}
              options={years}
              control={control}
              error={errors.expiryYear?.message}
              className="date-select"
              variant="bordered"
              bgColor="var(--color-white)"
              styleLabel={{ marginBottom: "0px" }}
            />
          </div>
        </div>

        <FormInput
          label={t("merchant.completeProfile.fields.taxId")}
          name="taxId"
          placeholder={t("merchant.completeProfile.placeholders.taxId")}
          control={control}
          error={errors.taxId?.message}
          required
          bgColor="var(--color-white)"
          variant="bordered"
          styleLabel={{ marginBottom: "0px" }}
        />

        <div className="upload-section">
          <label className="form-label">
            {t("merchant.completeProfile.fields.uploadBusinessFile")}
          </label>

          <FormFileUpload
            name="businessLicenseFile"
            placeholder={t(
              "merchant.completeProfile.placeholders.businessLicenseFile"
            )}
            control={control}
            error={errors.businessLicenseFile?.message}
            variant="bordered"
            bgColor="var(--color-primary-background)"
            accept=".pdf,.jpg,.jpeg,.png"
          />
          <FilePreview name="businessLicenseFile" control={control} />


          <FormFileUpload
            name="businessFile1"
            placeholder={t(
              "merchant.completeProfile.placeholders.businessFile"
            )}
            control={control}
            error={errors.businessFile1?.message}
            variant="bordered"
            bgColor="var(--color-primary-background)"
            accept=".pdf,.jpg,.jpeg,.png"
          />
          <FilePreview name="businessFile1" control={control} />

          <FormFileUpload
            name="businessFile2"
            placeholder={t(
              "merchant.completeProfile.placeholders.businessFile"
            )}
            control={control}
            error={errors.businessFile2?.message}
            variant="bordered"
            bgColor="var(--color-primary-background)"
            accept=".pdf,.jpg,.jpeg,.png"
          />
          <FilePreview name="businessFile2" control={control} />

          <p className="upload-note">
            {t("merchant.completeProfile.uploadNote")}
          </p>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-submit" disabled={isSubmitting}>
          {t("merchant.completeProfile.buttons.continue")}
        </button>
           <button
          type="button"
          onClick={onBack}
          className="btn-back"
        >
          {t("merchant.completeProfile.buttons.previous")}
        </button>
      </div>
        </div>
    </form>
  );
};

export default LegalInfoForm;
