import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import FormCheckbox from "../../../../common/Formcheckbox";
import { useTranslation } from "react-i18next";
import "./Terms.css";

const Terms = ({ onNext, onBack, initialData = {} }) => {
  const { t } = useTranslation();

  const termsSchema = z.object({
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: t("merchant.completeProfile.termsForm.validation.agreeRequired"),
    }),
    acknowledgeCorrectInfo: z.boolean().refine((val) => val === true, {
      message: t(
        "merchant.completeProfile.termsForm.validation.acknowledgeRequired"
      ),
    }),
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(termsSchema),
    defaultValues: {
      agreeToTerms: initialData.agreeToTerms || false,
      acknowledgeCorrectInfo: initialData.acknowledgeCorrectInfo || false,
    },
  });

  const onSubmit = async (data) => {
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="terms-form">
      
      <div className="completeScrollable">
      <div className="form-section">
        <h2 className="section-title">
          {t("merchant.completeProfile.termsForm.title")}
        </h2>

        <div className="terms-text-container">
          <div className="terms-text-content">
            {t("merchant.completeProfile.termsForm.termsContent")}
          </div>
        </div>

        <div className="terms-checkboxes">
          <FormCheckbox
            name="agreeToTerms"
            label={t("merchant.completeProfile.termsForm.agreeToTermsLabel")}
            control={control}
          />
          {errors.agreeToTerms && (
            <span className="form-error-message" role="alert">
              {errors.agreeToTerms.message}
            </span>
          )}

          <FormCheckbox
            name="acknowledgeCorrectInfo"
            label={t("merchant.completeProfile.termsForm.acknowledgeLabel")}
            control={control}
          />
          {errors.acknowledgeCorrectInfo && (
            <span className="form-error-message" role="alert">
              {errors.acknowledgeCorrectInfo.message}
            </span>
          )}
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-submit" disabled={isSubmitting}>
          {t("merchant.completeProfile.buttons.continue")}
        </button>
        {/* <button type="button" className="btn-back" onClick={onBack}>
          {t("merchant.completeProfile.buttons.previous")}
        </button> */}
      </div>
      </div>
    </form>
  );
};

export default Terms;
