import "./ProductShippingStep.css";
import { useState, useEffect, useRef } from "react";
import { Trash as Trash2 } from "../../../../../assets/icons";
import FormInput from "../../../../common/FormInput";
import FormNumberInput from "../../../../common/FormNumberInput/FormNumberInput";
import FormRadioButtons from "../../../../common/FormRadioButtons/FormRadioButtons";
import SwitchInput from "../../../../common/SwitchInput/SwitchInput";
import CustomSwitch from "../../../../common/CustomSwitch";
import CountrySelect from "../../../../common/CountrySelect";
import CountrySelector from "../CountrySelector/CountrySelector";
import ShippingInstructions from "../../../../common/ShippingInstructions/ShippingInstructions";
import useGeneral from "../../../../../hooks/useGeneral";
import { imageUrl } from "../../../../../helper/helper";


//  originCountryCode       originCountryCode
//  hsCode                  hsCode
//  fulfillBy               fulfillBy               (MERCHANT | PLATFORM)
//  fulfillmentTimeInDays   fulfillmentTimeInDays
//  shippingInstructions    shippingInstructions
//  shippableCountries      shippableCountries       (synced from addedCountries state)
//  moq                     skus[].moq
//  packQty                 skus[].packQty
//  allowGiftWrap           allowGiftWrap

const ProductShippingStep = ({
  control,
  errors,
  setValue,
  getValues,
  watch,
}) => {
  const [addedCountries, setAddedCountries] = useState([]);
  const [selectedCountryRows, setSelectedCountryRows] = useState([]);
  const initializedRef = useRef(false);
  const justInitializedRef = useRef(false);

  const { fetchCountriesList, countries } = useGeneral();

  const COUNTRY_OPTIONS = countries.map((c) => ({
    label: c.name_i18n?.en || c.name,
    value: c.countryCode,
    flag: c.flagId,
    code: c.countryCode,
  }));

  const shippableCountries = watch("shippableCountries");

  useEffect(() => {
    fetchCountriesList();
  }, []);

  // Initialise the "Added countries" table when loading an existing product
  useEffect(() => {
    if (initializedRef.current) return;
    if (!COUNTRY_OPTIONS.length || !shippableCountries?.length) return;
    const initial = shippableCountries
      .map((code) => COUNTRY_OPTIONS.find((c) => c.value === code))
      .filter(Boolean)
      .map((c) => ({ name: c.label, flag: c.flag, code: c.code, active: true, id: c.value }));
    if (initial.length > 0) {
      initializedRef.current = true;
      justInitializedRef.current = true;
      setAddedCountries(initial);
    }
  }, [COUNTRY_OPTIONS.length, JSON.stringify(shippableCountries)]);


  useEffect(() => {
    if (!setValue) return;
    if (addedCountries.length === 0 && !initializedRef.current) return;
    const codes = addedCountries.filter((c) => c.active).map((c) => c.code);
    const isJustInit = justInitializedRef.current;
    justInitializedRef.current = false;
    setValue("shippableCountries", codes, { shouldDirty: !isJustInit });
  }, [addedCountries, setValue]);

  // If no parent control provided, render nothing useful
  if (!control) {
    return <div className="pss-wrapper">Shipping tab — no form control.</div>;
  }

  const handleAddCountry = () => {
    const current = getValues("selectedCountry");
    if (current === "all") return;
    const country = COUNTRY_OPTIONS.find((c) => c.value === current);
    if (!country) return;
    setAddedCountries((prev) => {
      if (prev.find((c) => c.id === country.value)) return prev;
      return [
        ...prev,
        {
          name: country.label,
          flag: country.flag,
          code: country.code,
          active: true,
          id: country.value,
        },
      ];
    });
  };

  const handleDeleteCountries = () => {
    setAddedCountries((prev) =>
      prev.filter((c) => !selectedCountryRows.includes(c.id))
    );
    setSelectedCountryRows([]);
  };

  const handleToggleCountryActive = (id) => {
    setAddedCountries((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  };

  const handleToggleCountryRow = (id) => {
    setSelectedCountryRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  return (
    <div className="pss-wrapper">
      <div className="pss-form">
        {/* ── GLOBAL SHIPPING RULES ── */}
        <div className="pss-section">
          <h2 className="pss-section-title">Global shipping rules</h2>
          <div className="pss-section-divider" />

          <div className="pss-row-2col">
            <CountrySelect
              label="Origin country"
              name="originCountryCode"
              control={control}
              error={errors?.originCountryCode?.message}
              bgColor="var(--color-white)"
              valueKey="countryCode"
              variant="bordered"
              options={countries}
              styleLabel={{ marginBottom: "0px" }}
            />
            <FormInput
              label="HS code"
              name="hsCode"
              placeholder="6–10 digit code"
              control={control}
              error={errors?.hsCode?.message}
              variant="bordered"
              styleLabel={{ marginBottom: "0px" }}
            />
          </div>
        </div>

        {/* ── FULFILLMENT ── */}
        <div className="pss-card">
          <h2 className="pss-card-title">Fulfillment</h2>
          <div className="pss-card-divider" />

          <div className="pss-row-2col">
            <FormRadioButtons
              name="fulfillBy"
              label="Fulfilled by"
              control={control}
              options={[
                { label: "Merchant", value: "MERCHANT" },
                { label: "Platform", value: "PLATFORM" },
              ]}
              multiple={false}
              direction="row"
            />
            <FormNumberInput
              label="Fulfillment time (days)"
              name="fulfillmentTimeInDays"
              control={control}
              placeholder="1"
              min={1}
              error={errors?.fulfillmentTimeInDays?.message}
            />
          </div>
        </div>

        {/* ── SHIPPING INSTRUCTIONS ── */}
        <ShippingInstructions
          name="shippingInstructions"
          control={control}
          error={errors?.shippingInstructions?.message}
        />

        {/* ── SHIPPING TO ── */}
        <div className="pss-section">
          <h2 className="pss-section-title">Shipping to</h2>
          <div className="pss-section-divider" />

          <CountrySelector
            label="Add country"
            name="selectedCountry"
            control={control}
            onAdd={handleAddCountry}
            options={[
              { label: "All world", value: "all" },
              ...COUNTRY_OPTIONS,
            ]}
            placeholder="All world"
            error={errors.shippableCountries?.message}
          />

          <div className="pss-added-countries">
            <div className="pss-countries-header">
              <span className="pss-field-label">Added countries</span>
              {selectedCountryRows.length > 0 && (
                <button
                  type="button"
                  className="pss-delete-btn"
                  onClick={handleDeleteCountries}
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              )}
            </div>

            <div className="pss-country-table">
              <div className="pss-country-table__head">
                <span className="pss-country-table__check" />
                <span className="pss-country-table__col pss-country-table__col--name">
                  Name
                </span>
                <span className="pss-country-table__col pss-country-table__col--code">
                  Code
                </span>
                <span className="pss-country-table__col pss-country-table__col--status">
                  Status
                </span>
              </div>
              {addedCountries.map((country) => (
                <div key={country.id} className="pss-country-table__row">
                  <label className="pss-country-table__check">
                    <input
                      type="checkbox"
                      checked={selectedCountryRows.includes(country.id)}
                      onChange={() => handleToggleCountryRow(country.id)}
                      className="pss-checkbox"
                    />
                  </label>
                  <span className="pss-country-table__col pss-country-table__col--name">
                    {country.flag && (
                      <img
                        src={`${imageUrl}${country.flag}`}
                        className="pss-country-flag-img"
                        alt={country.name}
                      />
                    )}
                    {country.name}
                  </span>
                  <span className="pss-country-table__col pss-country-table__col--code">
                    {country.code}
                  </span>
                  <span className="pss-country-table__col pss-country-table__col--status">
                    <CustomSwitch
                      checked={country.active}
                      onChange={() => handleToggleCountryActive(country.id)}
                      containerWidth={40}
                      containerHeight={20}
                      thumbWidth={16}
                      thumbHeight={16}
                      activeColor="var(--color-primary)"
                    />
                    <span
                      className={`pss-status-text ${country.active ? "pss-status-text--active" : ""}`}
                    >
                      {country.active ? "Active" : "Inactive"}
                    </span>
                  </span>
                </div>
              ))}
              {addedCountries.length === 0 && (
                <div className="pss-country-table__empty">
                  No countries added yet
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pss-horizontal-divider" />

        {/* ── SHIPPING OPTIONS ── */}
        <div className="pss-section">
          <h2 className="pss-section-title">Shipping options</h2>
          <div className="pss-section-divider" />

          <div className="pss-row-2col">
            <FormNumberInput
              label="MOQ"
              name="moq"
              control={control}
              placeholder="1"
              min={1}
              error={errors?.moq?.message}
            />
            <FormNumberInput
              label="Pack qty"
              name="packQty"
              control={control}
              placeholder="1"
              min={1}
              error={errors?.packQty?.message}
            />
          </div>

          <div className="pss-gift-wrap-divider" />

          <SwitchInput
            name="allowGiftWrap"
            control={control}
            label="Allow gift wrap"
            gap="12px"
          />

          <div className="pss-gift-wrap-divider" />
        </div>
      </div>
    </div>
  );
};

export default ProductShippingStep;