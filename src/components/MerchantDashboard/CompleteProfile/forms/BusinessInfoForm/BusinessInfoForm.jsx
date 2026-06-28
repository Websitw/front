import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import FormInput from "../../../../common/FormInput";
import FormSelect from "../../../../common/FormSelect";
// import FormDateSelect from '../../../common/FormDateSelect';
import { useTranslation } from "react-i18next";
import "./BusinessInfoForm.css";
import { useEffect } from "react";
import { fetchIndustries } from "../../../../../store/slices/industriesSlice";
import { useDispatch, useSelector } from "react-redux";

const BusinessInfoForm = ({ onNext, onBack, initialData = {} }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.industries);
  const businessInfoSchema = z.object({
    businessLegalName: z
      .string()
      .min(1, t("merchant.completeProfile.validation.required"))
      .default("test"),
    businessTradeName: z
      .string()
      .min(1, t("merchant.completeProfile.validation.required"))
      .default("test"),
    businessType: z
      .string()
      .min(1, t("merchant.completeProfile.validation.required")),
    businessIndustry: z
      .string()
      .min(1, t("merchant.completeProfile.validation.required")),
    merchantType: z
      .string()
      .min(1, t("merchant.completeProfile.validation.required")),
    startDay: z.string().optional(),
    startMonth: z.string().optional(),
    startYear: z.string().optional(),
    numberOfEmployees: z.string().optional(),
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: {
      businessLegalName: initialData.businessLegalName || "",
      businessTradeName: initialData.businessTradeName || "",
      businessType: initialData.businessType || "",
      businessIndustry: initialData.businessIndustry || "",
      merchantType: initialData.merchantType || "SEGMENT",
      startDay: initialData.startDay || "",
      startMonth: initialData.startMonth || "",
      startYear: initialData.startYear || "",
      numberOfEmployees: initialData.numberOfEmployees || "",
    },
  });

 
  
  const onSubmit = async (data) => {
    onNext(data);
  };

  const businessTypes = [
    {
      value: "sole_proprietorship",
      label: t("merchant.completeProfile.businessTypes.soleProprietorship"),
    },
    {
      value: "partnership",
      label: t("merchant.completeProfile.businessTypes.partnership"),
    },
    {
      value: "corporation",
      label: t("merchant.completeProfile.businessTypes.corporation"),
    },
    { value: "llc", label: t("merchant.completeProfile.businessTypes.llc") },
  ];

  const employeeRanges = [
    { value: "1-10", label: "1-10" },
    { value: "11-50", label: "11-50" },
    { value: "51-100", label: "51-100" },
    { value: "101-500", label: "101-500" },
    { value: "500+", label: "500+" },
  ];

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
  const years = Array.from({ length: 100 }, (_, i) => ({
    value: String(currentYear - i),
    label: String(currentYear - i),
  }));

  useEffect(() => {
    dispatch(fetchIndustries());
  }, [dispatch]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="business-info-form">
      <div className="completeScrollable">
        <div className="form-section">
          <h2 className="section-title">
            {t("merchant.completeProfile.sections.businessOverview")}
          </h2>

          <FormInput
            label={t("merchant.completeProfile.fields.businessLegalName")}
            name="businessLegalName"
            placeholder={t("merchant.completeProfile.placeholders.tradeName")}
            control={control}
            error={errors.businessLegalName?.message}
            required
            bgColor="var(--color-white)"
            variant="bordered"
            styleLabel={{ marginBottom: "0px" }}
          />

          <FormInput
            label={t("merchant.completeProfile.fields.businessTradeName")}
            name="businessTradeName"
            placeholder={t("merchant.completeProfile.placeholders.tradeName")}
            control={control}
            error={errors.businessTradeName?.message}
            required
            bgColor="var(--color-white)"
            variant="bordered"
            styleLabel={{ marginBottom: "0px" }}
          />

          <FormSelect
            label={t("merchant.completeProfile.fields.businessType")}
            name="businessType"
            placeholder={t(
              "merchant.completeProfile.placeholders.businessType"
            )}
            options={businessTypes}
            control={control}
            error={errors.businessType?.message}
            required
            variant="bordered"
            bgColor="var(--color-white)"
            styleLabel={{ marginBottom: "0px" }}
          />

          <FormSelect
            label="Merchant Type"
            name="merchantType"
            placeholder="Select Merchant Type"
            options={[
              { value: "SEGMENT", label: "Segment" },
              { value: "BRAND_OWNER", label: "Brand Owner" },
            ]}
            control={control}
            error={errors.merchantType?.message}
            required
            variant="bordered"
            bgColor="var(--color-white)"
            styleLabel={{ marginBottom: "0px" }}
          />

          <FormSelect
            label={t("merchant.completeProfile.fields.businessIndustry")}
            name="businessIndustry"
            placeholder={t(
              "merchant.completeProfile.placeholders.businessIndustry"
            )}
            options={items.map((industry) => ({
              value: industry.id,
              label: industry.name,
            }))}
            control={control}
            error={errors.businessIndustry?.message}
            required
            variant="bordered"
            bgColor="var(--color-white)"
            styleLabel={{ marginBottom: "0px" }}
          />

          <div className="form-group">
            <label className="form-label" style={{ marginBottom: "0px" }}>
              {t("merchant.completeProfile.fields.businessStartDate")}
              <span className="optional-text">
                {" "}
                ({t("merchant.completeProfile.optional")})
              </span>
            </label>
            <div className="date-select-group">
              <FormSelect
                name="startDay"
                placeholder={t("merchant.completeProfile.placeholders.day")}
                options={days}
                control={control}
                className="date-select"
                variant="bordered"
                bgColor="var(--color-white)"
                styleLabel={{ marginTop: "0px", marginBottom: "0px" }}
              />
              <FormSelect
                name="startMonth"
                placeholder={t("merchant.completeProfile.placeholders.month")}
                options={months}
                control={control}
                className="date-select"
                variant="bordered"
                bgColor="var(--color-white)"
                styleLabel={{ marginBottom: "0px" }}
              />
              <FormSelect
                name="startYear"
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

          <FormSelect
            label={t("merchant.completeProfile.fields.numberOfEmployees")}
            name="numberOfEmployees"
            placeholder={t(
              "merchant.completeProfile.placeholders.employeesNumber"
            )}
            options={employeeRanges}
            control={control}
            className="form-group-optional"
            variant="bordered"
            bgColor="var(--color-white)"
            styleLabel={{ marginBottom: "0px" }}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            {t("merchant.completeProfile.buttons.continue")}
          </button>
          <button type="button" onClick={onBack} className="btn-back">
            {t("merchant.completeProfile.buttons.previous")}
          </button>
        </div>
      </div>
    </form>
  );
};

export default BusinessInfoForm;
