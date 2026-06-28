import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import FormInput from "../../../../common/FormInput";
import FormPhoneInput from "../../../../common/FormPhoneInput";
import { useTranslation } from "react-i18next";
import "./ContactInfo.css";

const ContactInfo = ({ onSubmit: onFinalSubmit, onBack, initialData = {}, isSubmitting: parentIsSubmitting = false, error = null }) => {
  const { t } = useTranslation();

  const contactInfoSchema = z.object({
    userTitle: z
      .string()
      .min(1, t("merchant.completeProfile.validation.required")),
    fullName: z
      .string()
      .min(1, t("merchant.completeProfile.validation.required")),
    businessEmail: z
      .string()
      .min(1, t("merchant.completeProfile.validation.required"))
      .email(t("merchant.completeProfile.validation.invalidEmail")),
    secondBusinessEmail: z
      .string()
      .email(t("merchant.completeProfile.validation.invalidEmail"))
      .optional()
      .or(z.literal("")),
    thirdBusinessEmail: z
      .string()
      .email(t("merchant.completeProfile.validation.invalidEmail"))
      .optional()
      .or(z.literal("")),
    businessPhone: z
      .string()
      .min(1, t("merchant.completeProfile.validation.required")),
    secondBusinessPhone: z.string().optional(),
    thirdBusinessPhone: z.string().optional(),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: {
      userTitle: initialData.userTitle || "",
      fullName: initialData.fullName || "",
      businessEmail: initialData.businessEmail || "",
      secondBusinessEmail: initialData.secondBusinessEmail || "",
      thirdBusinessEmail: initialData.thirdBusinessEmail || "",
      businessPhone: initialData.businessPhone || "",
      secondBusinessPhone: initialData.secondBusinessPhone || "",
      thirdBusinessPhone: initialData.thirdBusinessPhone || "",
    },
  });

  const onSubmit = async (data) => {
    onFinalSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="contact-info-form">
      <div className="completeScrollable">
      <div className="form-section">
        <h2 className="section-title">
          {t("merchant.completeProfile.sections.businessContact")}
        </h2>

        <FormInput
          label={t("merchant.completeProfile.fields.userTitle")}
          name="userTitle"
          placeholder={t("merchant.completeProfile.placeholders.userTitle")}
          control={control}
          error={errors.userTitle?.message}
          required
          bgColor="var(--color-white)"
          variant="bordered"
          styleLabel={{marginBottom:"0px"}}
        />

        <FormInput
          label={t("merchant.completeProfile.fields.fullName")}
          name="fullName"
          placeholder={t("merchant.completeProfile.placeholders.fullName")}
          control={control}
          error={errors.fullName?.message}
          required
          bgColor="var(--color-white)"
          variant="bordered"
          styleLabel={{marginBottom:"0px"}}
        />

        <FormInput
          label={t("merchant.completeProfile.fields.businessEmail")}
          name="businessEmail"
          type="email"
          placeholder={t("merchant.completeProfile.placeholders.businessEmail")}
          control={control}
          error={errors.businessEmail?.message}
          required
          bgColor="var(--color-white)"
          variant="bordered"
          styleLabel={{marginBottom:"0px"}}
        />

        <div >
          <label className="form-label">
            {t("merchant.completeProfile.fields.otherBusinessEmail")}
            <span className="optional-text">
              {" "}
              ({t("merchant.completeProfile.optional")})
            </span>
          </label>

          <FormInput
            name="secondBusinessEmail"
            placeholder={t(
              "merchant.completeProfile.placeholders.secondBusinessEmail"
            )}
            control={control}
            error={errors.secondBusinessEmail?.message}
            bgColor="var(--color-white)"
            variant="bordered"
            className="form-group-no-margin"
            styleLabel={{marginBottom:"0px"}}
          />

          <FormInput
            name="thirdBusinessEmail"
            placeholder={t(
              "merchant.completeProfile.placeholders.thirdBusinessEmail"
            )}
            control={control}
            error={errors.thirdBusinessEmail?.message}
            bgColor="var(--color-white)"
            variant="bordered"
            className="form-group-no-margin"
            styleLabel={{marginBottom:"0px"}}
          />
        </div>

        <FormPhoneInput
          label={t("merchant.completeProfile.fields.businessPhone")}
          name="businessPhone"
          placeholder={t("merchant.completeProfile.placeholders.phoneNumber")}
          control={control}
          error={errors.businessPhone?.message}
          required
          bgColor="var(--color-white)"
          variant="bordered"
          defaultCountryCode="+962"
          styleLabel={{marginBottom:"0px"}}
        />

        <div className="form-group">
          <label className="form-label">
            {t("merchant.completeProfile.fields.businessPhoneOptional")}
            <span className="optional-text">
              {" "}
              ({t("merchant.completeProfile.optional")})
            </span>
          </label>

          <FormPhoneInput
            name="secondBusinessPhone"
            placeholder={t("merchant.completeProfile.placeholders.phoneNumber")}
            control={control}
            error={errors.secondBusinessPhone?.message}
            bgColor="var(--color-white)"
            variant="bordered"
            defaultCountryCode="+962"
            className="form-group-no-margin"
          />

          <FormPhoneInput
            name="thirdBusinessPhone"
            placeholder={t("merchant.completeProfile.placeholders.phoneNumber")}
            control={control}
            error={errors.thirdBusinessPhone?.message}
            bgColor="var(--color-white)"
            variant="bordered"
            defaultCountryCode="+962"
            className="form-group-no-margin"
          />
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ color: 'red', padding: '10px', marginTop: '10px', backgroundColor: '#fee', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <div className="form-actions">
        <button type="submit" className="btn-submit" disabled={parentIsSubmitting}>
          {parentIsSubmitting ? t("merchant.completeProfile.buttons.submitting") || "Submitting..." : t("merchant.completeProfile.buttons.setupaccount")}
        </button>
        <button
          type="button"
          className="btn-back"
          onClick={onBack}
          disabled={parentIsSubmitting}
        >
          {t("merchant.completeProfile.buttons.previous")}
        </button>
      </div>
      </div>
    </form>
  );
};

export default ContactInfo;
