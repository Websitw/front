import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import FormInput from "../../../../common/FormInput";
import FormSelect from "../../../../common/FormSelect";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import "./LocationInfo.css";
import {  useEffect } from "react";
import { fetchCountriesListAnonymous } from "../../../../../store/slices/counteriesSlice";
import { useDispatch, useSelector } from "react-redux";
import CountrySelect from "../../../../common/CountrySelect";

const LocationInfoForm = ({ onNext, onBack, initialData = {} }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { allCountriesList } = useSelector((state) => state.countries);
  
  console.log("allCountriesList in location info",allCountriesList)
  const locationInfoSchema = z.object({
    locations: z.array(
      z.object({
        country: z
          .string()
          .min(1, t("merchant.completeProfile.validation.required")),
        city: z
          .string()
          .min(1, t("merchant.completeProfile.validation.required")),
        fullAddress: z
          .string()
          .min(1, t("merchant.completeProfile.validation.required")),
      })
    ).min(1, t("merchant.completeProfile.validation.atLeastOneLocation")),
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(locationInfoSchema),
    defaultValues: {
      locations: initialData.locations || [
        {
          country: "",
          city: "",
          fullAddress: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "locations",
  });

  const onSubmit = async (data) => {
    onNext(data);
  };

  const handleAddLocation = () => {
    append({
      country: "",
      city: "",
      fullAddress: "",
    });
  };

  useEffect(() => {
    dispatch(fetchCountriesListAnonymous());
  }, [dispatch]);
 
  // Mock cities - you can replace with actual data based on selected country
  const cities = [
    { value: "amman", label: t("merchant.completeProfile.cities.amman") },
    { value: "riyadh", label: t("merchant.completeProfile.cities.riyadh") },
    { value: "dubai", label: t("merchant.completeProfile.cities.dubai") },
    { value: "cairo", label: t("merchant.completeProfile.cities.cairo") },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="location-info-form">
      <div className="completeScrollable">
      <div className="form-section">
        <h2 className="section-title">
          {t("merchant.completeProfile.sections.businessLocation")}
        </h2>

        {fields.map((field, index) => (
          <div key={field.id} className="location-group">
            <div className="location-header">
              {index === 0 ? (
                <label className="location-label">
                  {t("merchant.completeProfile.fields.mainAddress")}
                </label>
              ) : (
                <>
                  <label className="location-label">
                    {t("merchant.completeProfile.fields.additionalAddress")} {index}
                  </label>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="btn-remove-location"
                  >
                    {t("merchant.completeProfile.buttons.remove")}
                  </button>
                </>
              )}
            </div>

            <CountrySelect
              label={t("merchant.completeProfile.fields.businessCountry")}
              name={`locations.${index}.country`}
              placeholder={t("merchant.completeProfile.placeholders.countryName")}
              options={allCountriesList}
              control={control}
              error={errors.locations?.[index]?.country?.message}
              required
              variant="bordered"
              showFlag={true}
              style={{padding:"4px 14px"}}
              bgColor="var(--color-white)"
              styleLabel={{marginBottom:"0px"}}
            />

            <FormSelect
              label={t("merchant.completeProfile.fields.city")}
              name={`locations.${index}.city`}
              placeholder={t("merchant.completeProfile.placeholders.city")}
              options={cities}
              control={control}
              error={errors.locations?.[index]?.city?.message}
              required
              variant="bordered"
              bgColor="var(--color-white)"
              styleLabel={{marginBottom:"0px"}}
            />

            <FormInput
              label={t("merchant.completeProfile.fields.fullAddress")}
              name={`locations.${index}.fullAddress`}
              placeholder={t("merchant.completeProfile.placeholders.fullAddress")}
              control={control}
              error={errors.locations?.[index]?.fullAddress?.message}
              required
              bgColor="var(--color-white)"
              variant="bordered"
              styleLabel={{marginBottom:"0px"}}
            />
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddLocation}
          className="btn-add-location"
        >
          <Plus size={18}  className="plus-icon"/>
          {t("merchant.completeProfile.buttons.addSecondLocation")}
        </button>
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

export default LocationInfoForm;
