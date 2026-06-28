import React, { useState, useEffect, use } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import DeleteIcon from "@mui/icons-material/Delete";
import arrowupIcon from "../../../assets/userSidebar/arrowup.svg";
import { useTranslation } from "react-i18next";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import CitiesDrawer from "./CitiesDrawer";
import TaxGroupModal from "./TaxGroupModal/TaxGroupModal";
import { getRegionsAll } from "../../../store/slices/regionSlice";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { countrySchema } from "../../../components/Admin/Schemas/countrySchema";
import {
  createCountriesConfig,
  getCountriesConfig,
} from "../../../store/slices/counteryConfig";
import {
  updateCity,
  deleteCity,
  createCity,
} from "../../../store/slices/citiesSlice";
import {
  createTax,
  updateTax,
  deleteTax,
} from "../../../store/slices/taxSlice";
import FormInput from "../../../components/common/FormInput";
import FormNumberInput from "../../../components/common/FormNumberInput";
import FormSelect from "../../../components/common/FormSelect";
import ConfirmDialog from "../../../components/Admin/Modal/Modal";
import FormFileUpload from "../../../components/common/FormFileUpload";
import { uploadImage, imageUrl } from "../../../helper/helper";
import { fetchLanguages } from "../../../store/slices/languageSlice";
import { Information } from "../../../assets/icons";
import {
  fetchAllCountries,
  updateCountry,
} from "../../../store/slices/counteriesSlice";
import CountryInfoDisplay from "./configureComponents/CountryInfoDisplay/CountryInfoDisplay";
import CitiesInfo from "./configureComponents/CitiesInfo/CitiesInfo";
import PaymentMethod from "./configureComponents/PaymentMethods/PaymentMethods";
import TaxSystemInfo from "./configureComponents/TaxSystemInfo/TaxSystemInfo";
import CurrencyInfo from "./configureComponents/CurrencyInfo/CurrencyInfo";
import { updateExchangeRate } from "../../../store/slices/exchangeSlice";

const countries = [
  {
    name: "Jordan",
    flag: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Flag_of_Jordan.svg",
  },
  {
    name: "Saudi Arabia",
    flag: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Flag_of_Saudi_Arabia.svg",
  },
  {
    name: "UAE",
    flag: "https://upload.wikimedia.org/wikipedia/commons/c/cb/Flag_of_the_United_Arab_Emirates.svg",
  },
];
import CustomSwitch from "../../../components/common/CustomSwitch";
import { Trash, EditIcon } from "../../../assets/icons";
import CountryFlagSelect from "../../../components/common/CountryFlagSelect";
import { showToast } from "../../../components/CustomToast/CustomToast";
import { environment } from "../../../environments/environment";

/**
 * Transforms form data to match backend API structure
 * @param {Object} countryData - Step 1 country info data
 * @param {Array} cities - Step 2 cities data
 * @param {String} currencyId - Step 3 selected currency
 * @param {Array} taxGroups - Step 4 tax groups data
 * @param {Object} exchangeRatesData - Exchange rates object with currencyCode as key and fxRate as value
 * @param {Array} currencies - List of all available currencies
 * @returns {Object} Transformed data matching backend structure
 */

const transformData = (
  countryData,
  cities,
  currencyId,
  taxGroups,
  exchangeRatesData,
  currencies
) => {
  // Parse coordinates from latitude string (format: "lat,lng" or just lat)
  const parseCoordinates = (latitudeStr) => {
    if (!latitudeStr) return { latitude: "", longitude: "" };
    const parts = latitudeStr.split(",");
    return {
      latitude: parts[0]?.trim() || "",
      longitude: parts[1]?.trim() || "",
    };
  };

  // Transform country info
  const countryInfo = {
    countryCode: countryData.countryCode || "",
    countryCodeNumeric: countryData.countryCodeNumeric || 0, 
    name: countryData.nameEn || "",
    name_i18n: {
      en: countryData.nameEn || "",
      ar: countryData.nameAr || "",
    },
    regionId: countryData.regionId || "",
    defaultCurrencyId: currencyId || "",
    phoneCode: countryData.phoneCode || "",
    codeEnabled: countryData.codeEnabled ?? false,
    bnplEnabled: countryData.bnplEnabled ?? false,
    taxable: true, // Default to true, can be made configurable
    locale: "ar_AE", // TODO: Derive from country or make configurable
    status: "ACTIVE",
    flagId: countryData.flagId || "",
  };

  // Transform cities
  const transformedCities = cities.map((city) => {
    const coords = parseCoordinates(city.latitude);
    return {
      cityCode: city.cityCode || "",
      name: city.cityNameEn || "",
      name_i18n: {
        en: city.cityNameEn || "",
        ar: city.cityNameAr || "",
      },
      latitude: parseInt(coords.latitude),
      longitude: parseInt(coords.longitude),
      isCapital: city.isCapital ?? false,
      status: city.status || "ACTIVE",
    };
  });
  // Transform tax groups - flatten taxes array into individual tax groups
  const transformedTaxGroups = [];
  taxGroups.forEach((group) => {
    if (group.taxes && Array.isArray(group.taxes)) {
      group.taxes.forEach((tax, index) => {
        transformedTaxGroups.push({
          taxGroupCode:
            group.taxes.length > 1
              ? `${group.taxGroupCode}_${index + 1}`
              : group.taxGroupCode,
          name: tax.nameEn || "",
          name_i18n: {
            en: tax.nameEn || "",
            ar: tax.nameAr || "",
          },
          rate: parseFloat(tax.rate) || 0,
          isDefault: tax.isDefault ?? false,
          status: tax.status || "ACTIVE",
        });
      });
    }
  });

  // Transform exchange rates
  const transformedExchangeRates = Object.entries(exchangeRatesData || {}).map(
    ([currencyCode, fxRate]) => {
      // Find the currency ID from the currencies array
      const currency = currencies.find((c) => c.currencyCode === currencyCode);
      return {
        toCurrencyId: currency ? currency.id : currencyCode,
        fxRate: parseFloat(fxRate) || 0,
        fxRateDate: new Date().toISOString(),
        source: "MANUAL",
        status: "ACTIVE",
      };
    }
  );

  return {
    countryInfo,
    cities: transformedCities,
    taxGroups: transformedTaxGroups,
    exchangeRates: transformedExchangeRates,
  };
};

const CountryInfoInputs = ({
  regions,
  control,
  errors,
  watch,
  setValue,
  setImagePreview,
  isEditMode,
  imageEditPreview,
}) => {
  const { t } = useTranslation();
  const flagFile = watch("flagId");
  const [previewUrl, setPreviewUrl] = useState(null);
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.languages);
  console.log("Languages:", items);
  useEffect(() => {
    dispatch(fetchLanguages());
  }, [dispatch]);
  // Create and cleanup preview URL
  useEffect(() => {
    if (flagFile && flagFile instanceof File) {
      // Use FileReader to create a data URL that persists across component unmounts
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result;
        setPreviewUrl(dataUrl);
        setImagePreview(dataUrl);
      };
      reader.readAsDataURL(flagFile);
    } else {
      setPreviewUrl(null);
      setImagePreview(null);
    }
  }, [flagFile, setImagePreview]);

  const handleRemoveFlag = () => {
    setValue("flagId", null);
  };
  console.log("errors in country info inputs:", errors);
  return (
    <>
      <FormSelect
        label={t("countries.form.region")}
        name="regionId"
        placeholder={t("countries.form.regionPlaceholder")}
        control={control}
        options={
          regions?.map((region) => ({
            label: region.name,
            value: region.id,
          })) || []
        }
        error={errors.regionId?.message ? t(errors.regionId.message) : ""}
        variant="bordered"
        bgColor={"--var(color-white)"}
      />

      <FormInput
        label={t("countries.form.nameEn")}
        name="nameEn"
        type="text"
        placeholder={t("countries.form.nameEnPlaceholder")}
        control={control}
        error={errors.nameEn?.message ? t(errors.nameEn.message) : ""}
        variant="bordered"
        bgColor={"--var(color-white)"}
      />

      <FormInput
        label={t("countries.form.nameAr")}
        name="nameAr"
        type="text"
        placeholder={t("countries.form.nameArPlaceholder")}
        control={control}
        error={errors.nameAr?.message ? t(errors.nameAr.message) : ""}
        variant="bordered"
        bgColor={"--var(color-white)"}
      />
      <FormNumberInput
        label={t("countries.form.countryCodeNumeric")}
        name="countryCodeNumeric"
        placeholder={t("countries.form.countryCodeNumericPlaceholder")}
        control={control}
        error={errors.countryCodeNumeric?.message ? t(errors.countryCodeNumeric.message) : ""}
        variant="bordered"
        bgColor={"--var(color-white)"}
      />
      <FormInput
        label={t("countries.form.countryCode")}
        name="countryCode"
        type="text"
        placeholder={t("countries.form.countryCodePlaceholder")}
        control={control}
        error={errors.countryCode?.message ? t(errors.countryCode.message) : ""}
        variant="bordered"
        bgColor={"--var(color-white)"}
      />

      <FormInput
        label={t("countries.form.phoneCode")}
        name="phoneCode"
        type="text"
        placeholder={t("countries.form.phoneCodePlaceholder")}
        control={control}
        error={errors.phoneCode?.message ? t(errors.phoneCode.message) : ""}
        variant="bordered"
        bgColor={"--var(color-white)"}
      />

      <FormFileUpload
        label={t("countries.form.flagUpload")}
        name="flagId"
        placeholder={t("countries.form.flagUploadPlaceholder")}
        control={control}
        error={errors.flagId?.message ? t(errors.flagId.message) : ""}
        required
        accept=".jpg,.jpeg,.png,.svg"
        bgColor="var(--color-primary-background)"
      />

      {((flagFile && previewUrl) || (isEditMode && imageEditPreview)) && (
        <div
          style={{
            marginTop: "10px",
            marginBottom: "10px",
            padding: "15px",
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <img
                src={isEditMode && !previewUrl ? imageEditPreview : previewUrl}
                alt="Flag preview"
                style={{
                  width: "60px",
                  height: "40px",
                  objectFit: "cover",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                }}
              />
              <div>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: "500" }}>
                  {flagFile?.name || "Current flag"}
                </p>
                {flagFile && (
                  <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>
                    {(flagFile.size / 1024).toFixed(2)} KB
                  </p>
                )}
              </div>
            </div>
            {!isEditMode && (
              <button
                type="button"
                onClick={handleRemoveFlag}
                style={{
                  padding: "6px 12px",
                  fontSize: "14px",
                  color: "#d32f2f",
                  backgroundColor: "transparent",
                  border: "1px solid #d32f2f",
                  borderRadius: "4px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#d32f2f";
                  e.target.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                  e.target.style.color = "#d32f2f";
                }}
              >
                {t("common.delete") || "Remove"}
              </button>
            )}
          </div>
        </div>
      )}
      <FormSelect
        showInfoIcon={true}
        InfoIcon={Information}
        label={t("countries.form.defaultLanguage")}
        name="defaultLanguage"
        placeholder={t("countries.form.defaultLanguagePlaceholder")}
        options={items.map((lang) => {
          return {
            label: lang.name,
            value: lang.languageCode,
          };
        })}
        control={control}
        bgColor={"--var(color-white)"}
      />
    </>
  );
};

const ConfigureCountry = () => {
  const [openCities, setOpenCities] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  // Tax group selection state
  const [selectedTaxGroupIds, setSelectedTaxGroupIds] = useState([]);
  const [isTaxConfirmDialogOpen, setIsTaxConfirmDialogOpen] = useState(false);

  // Country selection state
  const [selectedCountryId, setSelectedCountryId] = useState(null);

  const { t } = useTranslation();
  const [countryOpen, setCountryOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isEditCitiesMode, setIsEditCitiesMode] = useState(false);
  const [isEditTaxMode, setIsEditTaxMode] = useState(false);
  const [isEditCurrencyMode, setIsEditCurrencyMode] = useState(false);

  const [modalStep, setModalStep] = useState(1);
  const [activeTab, setActiveTab] = useState("Country-info");

  const [currencies, setCurrencies] = useState([]);
  const [selected, setSelected] = useState("");
  const [exchangeRates, setExchangeRates] = useState({});
  const [editableExchangeRates, setEditableExchangeRates] = useState({});
  console.log("exchangeRates>>>", exchangeRates);
  // Store Step 1 country data
  const [countryData, setCountryData] = useState(null);

  // Store cities for current country
  const [countryCities, setCountryCities] = useState([]);

  // Store tax groups for current country
  const [countryTaxGroups, setCountryTaxGroups] = useState([]);
  const [openTaxModal, setOpenTaxModal] = useState(false);
  const [editingTaxGroup, setEditingTaxGroup] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageEditPreview, setImageEditPreview] = useState(null);
  const dispatch = useDispatch();
  const regions = useSelector((state) => state.regions.allRegions);
  const { allCountriesList } = useSelector((state) => state.countries);
  const { item } = useSelector((state) => state.countriesConfig);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(countrySchema),
    defaultValues: {
      regionId: "",
      nameEn: "",
      nameAr: "",
      countryCode: "",
      countryCodeNumeric:0,
      phoneCode: "",
      flagId: null,
      codeEnabled: false,
      bnplEnabled: false,
    },
  });
  const toggleModal = () => {
    setModalOpen((prev) => !prev);
    setModalStep(1);
    setIsEditMode(false);
    setIsEditCitiesMode(false);
    setIsEditTaxMode(false);
    setIsEditCurrencyMode(false);
    reset({
      regionId: "",
      nameEn: "",
      nameAr: "",
      countryCodeNumeric:0,
      countryCode: "",
      phoneCode: "",
      flagId: null,
      codeEnabled: false,
      bnplEnabled: false,
    });
    setCountryData(null);
    setCountryCities([]);
    setCountryTaxGroups([]);
    setEditingCity(null);
    setEditingTaxGroup(null);
    setSelectedIds([]);
    setSelectedTaxGroupIds([]);
    setImagePreview(null);
    setImageEditPreview(null);
    setSelected("");
    setExchangeRates({});
    setEditableExchangeRates({});
  };

  useEffect(() => {
    dispatch(getRegionsAll());
    dispatch(fetchAllCountries())
      .unwrap()
      .then((result) => {
        console.log("Fetched countries:", result);
        dispatch(
          getCountriesConfig(result?.items[result?.items.length - 1]?.id)
        );
      })
      .catch((error) => {
        showToast.error("Failed to fetch countries");
        console.error("Error fetching countries:", error);
      });
  }, [dispatch]);

  // Restore selectedCountryId from item when component remounts with existing data
  useEffect(() => {
    if (item && item.id && !selectedCountryId) {
      setSelectedCountryId(item.id);
    }
  }, [item]);

  // Log selected country ID for debugging
  useEffect(() => {
    console.log("Selected Country ID:", selectedCountryId);

    if (selectedCountryId) {
      dispatch(getCountriesConfig(selectedCountryId));
    }
  }, [selectedCountryId]);
  console.log("currencies", currencies);

  // Update cities when item.cities changes in edit mode
  useEffect(() => {
    if (isEditCitiesMode && item && item.cities) {
      const transformedCities = item.cities.map((city) => ({
        id: city.id,
        cityNameEn: city.name_i18n?.en || city.name || "",
        cityNameAr: city.name_i18n?.ar || "",
        cityCode: city.cityCode || "",
      
        countryId: selectedCountryId,
        latitude:
          city.latitude && city.longitude
            ? `${city.latitude},${city.longitude}`
            : "",
        isCapital: city.isCapital || false,
        status: city.status || "ACTIVE",
      }));
      setCountryCities(transformedCities);
    }
  }, [item?.cities, isEditCitiesMode, selectedCountryId]);

  // Update tax groups when item.taxGroups changes in edit mode
  useEffect(() => {
    if (isEditTaxMode && item && item.taxGroups) {
      const transformedTaxGroups = item.taxGroups.map((group) => ({
        id: group.id,
        taxGroupCode: group.taxGroupCode || "",
        status: group.status || "ACTIVE",
        taxes: [
          {
            nameEn: group.name_i18n?.en || group.name || "",
            nameAr: group.name_i18n?.ar || "",
            rate: group.rate || "",
            isDefault: group.isDefault || false,
            status: group.status || "ACTIVE",
          },
        ],
      }));
      setCountryTaxGroups(transformedTaxGroups);
    }
  }, [item?.taxGroups, isEditTaxMode, selectedCountryId]);

  useEffect(() => {
    axios
      .get(`${environment.serverOrigin}currencies?page=1&limit=20`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((response) => {
        setCurrencies(response.data?.items || []);
      })
      .catch((error) => {
        console.error("Error fetching currencies:", error);
      });
    setSelectedCountryId(allCountriesList[allCountriesList.length - 1]?.id);
  }, []);

  const handleNext = handleSubmit((data) => {
    console.log("Step 1 data:", data);
    // Store the form data for later use
    setCountryData(data);
    setModalStep(2);
  });

  const handlePrevious = () => {
    setModalStep(1);
  };

  const handlePreviousPayment = () => {
    setModalStep(3);
  };

  const handleExchangeRateChange = (currencyId, value) => {
    setExchangeRates((prev) => ({
      ...prev,
      [currencyId]: value,
    }));
  };

  const toggleEditableExchangeRate = (currencyId) => {
    setEditableExchangeRates((prev) => ({
      ...prev,
      [currencyId]: !prev[currencyId],
    }));
  };

  const handleNextPayment = () => {
    if (countryCities.length === 0) {
      showToast.error(t("cities.validation.noCitiesAdded"));
      return;
    }
    setModalStep(3);
  };

  const handleNextCurrency = () => {
    if (!selected) {
      showToast.error(t("currencies.validation.currencyRequired"));
      return;
    }

    const currenciesNeedingRates = currencies.filter((cur) => cur.id !== selected);
    const missingRates = currenciesNeedingRates.filter(
      (cur) => !exchangeRates[cur.id] || exchangeRates[cur.id] === ""
    );

    if (missingRates.length > 0) {
      showToast.error("Please enter exchange rates for all currencies");
      return;
    }

    setModalStep(4);
  };

  const handleCityAdded = async (city) => {
    if (isEditCitiesMode) {
      // In edit mode, use API to create city
      try {
        // Parse coordinates from latitude string
        const coords = city.latitude.split(",");
        const cityData = {
          name: city.cityNameEn,
          name_i18n: {
            en: city.cityNameEn,
            ar: city.cityNameAr,
          },
          cityCode: city.cityCode || "",
          countryId: selectedCountryId,
          latitude: coords[0]?.trim() || "",
          longitude: coords[1]?.trim() || "",
          isCapital: city.isCapital || false,
          status: "ACTIVE",
        };

        await dispatch(createCity(cityData))
          .unwrap()
          .then(() => {
            showToast.success("City added successfully");
            // Refresh country data to get updated cities list
            dispatch(getCountriesConfig(selectedCountryId));
            setOpenCities(false);
          })
          .catch((error) => {
            showToast.error(error?.message || "Failed to add city");
          });
      } catch (error) {
        showToast.error(error?.message || "Failed to add city");
        console.error("Failed to add city:", error);
      }
    } else {
      // In create mode, add to local state
      setCountryCities((prev) => [
        ...prev,
        { ...city, id: Date.now(), status: "ACTIVE" },
      ]);
      setOpenCities(false);
      showToast.success(t("dashboard.create_success"));
    }
  };

  const handleEditCity = (city) => {
    setEditingCity(city);
    setOpenCities(true);
  };

  const handleCityUpdated = async (updatedCity) => {
    if (isEditCitiesMode) {
      // In edit mode, use API to update city
      try {
        // Parse coordinates from latitude string
        const coords = updatedCity.latitude.split(",");
        const cityData = {
          name: updatedCity.cityNameEn,
          name_i18n: {
            en: updatedCity.cityNameEn,
            ar: updatedCity.cityNameAr,
          },
          cityCode: updatedCity.cityCode || "",
          countryId: selectedCountryId,
          latitude: coords[0]?.trim() || "",
          longitude: coords[1]?.trim() || "",
          isCapital: updatedCity.isCapital || false,
          status: updatedCity.status || "ACTIVE",
        };

        await dispatch(
          updateCity({
            cityId: updatedCity.id,
            cityData: cityData,
          })
        )
          .unwrap()
          .then(() => {
            showToast.success("City updated successfully");
            // Refresh country data to get updated cities list
            dispatch(getCountriesConfig(selectedCountryId));
            setOpenCities(false);
            setEditingCity(null);
          })
          .catch((error) => {
            showToast.error(error?.message || "Failed to update city");
          });
      } catch (error) {
        showToast.error(error?.message || "Failed to update city");
        console.error("Failed to update city:", error);
      }
    } else {
      // In create mode, update local state
      setCountryCities((prev) =>
        prev.map((city) => (city.id === updatedCity.id ? updatedCity : city))
      );
      setOpenCities(false);
      setEditingCity(null);
      showToast.success(t("dashboard.update_success"));
    }
  };

  const handleDeleteCity = async (cityId) => {
    if (isEditCitiesMode) {
      // In edit mode, use API to delete city
      try {
        await dispatch(deleteCity(cityId))
          .unwrap()
          .then(() => {
            showToast.success("City deleted successfully");
            // Refresh country data to get updated cities list
            dispatch(getCountriesConfig(selectedCountryId));
          })
          .catch((error) => {
            showToast.error(error?.message || "Failed to delete city");
          });
      } catch (error) {
        showToast.error(error?.message || "Failed to delete city");
        console.error("Failed to delete city:", error);
      }
    } else {
      // In create mode, delete from local state
      setCountryCities((prev) => prev.filter((city) => city.id !== cityId));
      showToast.success(t("dashboard.delete_success"));
    }
  };

  const handleToggleCityStatus = async (cityId) => {
    if (isEditCitiesMode) {
      // In edit mode, use API to toggle status
      try {
        const city = countryCities.find((c) => c.id === cityId);
        if (!city) return;

        const coords = city.latitude.split(",");
        const cityData = {
          name: city.cityNameEn,
          name_i18n: {
            en: city.cityNameEn,
            ar: city.cityNameAr,
          },
          cityCode: city.cityCode || "",
          countryId: selectedCountryId,
          latitude: coords[0]?.trim() || "",
          longitude: coords[1]?.trim() || "",
          isCapital: city.isCapital || false,
          status: city.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
        };

        await dispatch(
          updateCity({
            cityId: cityId,
            cityData: cityData,
          })
        )
          .unwrap()
          .then(() => {
            showToast.success("City status updated successfully");
            // Refresh country data to get updated cities list
            dispatch(getCountriesConfig(selectedCountryId));
          })
          .catch((error) => {
            showToast.error(error?.message || "Failed to update city status");
          });
      } catch (error) {
        showToast.error(error?.message || "Failed to update city status");
        console.error("Failed to update city status:", error);
      }
    } else {
      // In create mode, update local state
      setCountryCities((prev) =>
        prev.map((city) =>
          city.id === cityId
            ? {
                ...city,
                status: city.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
              }
            : city
        )
      );
    }
  };

  // Tax Group handlers
  const handleTaxGroupAdded = async (taxGroup) => {
    if (isEditTaxMode) {
      // In edit mode, use API to create tax
      try {
        // Transform the data to match API structure
        // Each tax in the taxes array becomes a separate tax group
        const taxPromises = taxGroup.taxes.map((tax) => {
          const taxData = {
            taxGroupCode: taxGroup.taxGroupCode,
            name: tax.nameEn,
            name_i18n: {
              en: tax.nameEn,
              ar: tax.nameAr,
            },
            rate: parseFloat(tax.rate),
            isDefault: tax.isDefault || false,
            status: "ACTIVE",
            countryId: selectedCountryId,
          };
          return dispatch(createTax(taxData)).unwrap();
        });

        await Promise.all(taxPromises)
          .then(() => {
            showToast.success("Tax group added successfully");
            // Refresh country data to get updated tax groups list
            dispatch(getCountriesConfig(selectedCountryId));
            setOpenTaxModal(false);
          })
          .catch((error) => {
            showToast.error(error?.message || "Failed to add tax group");
          });
      } catch (error) {
        showToast.error(error?.message || "Failed to add tax group");
        console.error("Failed to add tax group:", error);
      }
    } else {
      // In create mode, add to local state
      setCountryTaxGroups((prev) => [
        ...prev,
        { ...taxGroup, id: Date.now(), status: "ACTIVE" },
      ]);
      setOpenTaxModal(false);
    }
  };

  const handleEditTaxGroup = (taxGroup) => {
    setEditingTaxGroup(taxGroup);
    setOpenTaxModal(true);
  };

  const handleTaxGroupUpdated = async (updatedTaxGroup) => {
    if (isEditTaxMode) {
      // In edit mode, use API to update tax
      try {
        // Transform the data to match API structure
        const tax = updatedTaxGroup.taxes[0]; // Assuming single tax per group in edit mode
        const taxData = {
          taxGroupCode: updatedTaxGroup.taxGroupCode,
          name: tax.nameEn,
          name_i18n: {
            en: tax.nameEn,
            ar: tax.nameAr,
          },
          rate: parseFloat(tax.rate),
          isDefault: tax.isDefault || false,
          status: tax.status || "ACTIVE",
          countryId: selectedCountryId,
        };

        await dispatch(
          updateTax({
            taxId: updatedTaxGroup.id,
            taxData: taxData,
          })
        )
          .unwrap()
          .then(() => {
            showToast.success("Tax updated successfully");
            // Refresh country data to get updated tax groups list
            dispatch(getCountriesConfig(selectedCountryId));
            setOpenTaxModal(false);
            setEditingTaxGroup(null);
          })
          .catch((error) => {
            showToast.error(error?.message || "Failed to update tax");
          });
      } catch (error) {
        showToast.error(error?.message || "Failed to update tax");
        console.error("Failed to update tax:", error);
      }
    } else {
      // In create mode, update local state
      setCountryTaxGroups((prev) =>
        prev.map((group) =>
          group.id === updatedTaxGroup.id ? updatedTaxGroup : group
        )
      );
      setOpenTaxModal(false);
      setEditingTaxGroup(null);
    }
  };

  const handleDeleteTaxGroup = async (taxGroupId) => {
    if (isEditTaxMode) {
      // In edit mode, use API to delete tax
      try {
        await dispatch(deleteTax(taxGroupId))
          .unwrap()
          .then(() => {
            showToast.success("Tax deleted successfully");
            // Refresh country data to get updated tax groups list
            dispatch(getCountriesConfig(selectedCountryId));
          })
          .catch((error) => {
            showToast.error(error?.message || "Failed to delete tax");
          });
      } catch (error) {
        showToast.error(error?.message || "Failed to delete tax");
        console.error("Failed to delete tax:", error);
      }
    } else {
      // In create mode, delete from local state
      setCountryTaxGroups((prev) =>
        prev.filter((group) => group.id !== taxGroupId)
      );
      showToast.success(t("dashboard.delete_success"));
    }
  };

  const handleToggleTaxGroupStatus = async (taxGroupId) => {
    if (isEditTaxMode) {
      // In edit mode, use API to toggle status
      try {
        const taxGroup = countryTaxGroups.find((g) => g.id === taxGroupId);
        if (!taxGroup) return;

        const tax = taxGroup.taxes[0];
        const taxData = {
          taxGroupCode: taxGroup.taxGroupCode,
          name: tax.nameEn,
          name_i18n: {
            en: tax.nameEn,
            ar: tax.nameAr,
          },
          rate: parseFloat(tax.rate),
          isDefault: tax.isDefault || false,
          status: taxGroup.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
          countryId: selectedCountryId,
        };

        await dispatch(
          updateTax({
            taxId: taxGroupId,
            taxData: taxData,
          })
        )
          .unwrap()
          .then(() => {
            showToast.success("Tax status updated successfully");
            // Refresh country data to get updated tax groups list
            dispatch(getCountriesConfig(selectedCountryId));
          })
          .catch((error) => {
            showToast.error(error?.message || "Failed to update tax status");
          });
      } catch (error) {
        showToast.error(error?.message || "Failed to update tax status");
        console.error("Failed to update tax status:", error);
      }
    } else {
      // In create mode, update local state
      setCountryTaxGroups((prev) =>
        prev.map((group) =>
          group.id === taxGroupId
            ? {
                ...group,
                status: group.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
              }
            : group
        )
      );
    }
  };

  const handleDelete = () => {
    if (selectedIds.length === 0) {
      showToast.info(t("common.select_delete"));
      return;
    }
    setIsConfirmDialogOpen(true);
  };
  const handleCancelDelete = () => {
    setIsConfirmDialogOpen(false);
  };

  const confirmDelete = async () => {
    if (selectedIds.length !== 0) {
      try {
        handleDeleteCity(selectedIds[0]);
        setIsDeleting(true);
        setIsConfirmDialogOpen(false);
        setSelectedIds([]);
        setIsDeleting(false);
      } catch (error) {
        setIsDeleting(false);
        showToast.error(error?.message || t("dashboard.error"));
        console.error("Error deleting languages:", error);
      }
    }
  };
  const handleSelectIds = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Tax group selection handlers
  const handleSelectTaxGroupIds = (id) => {
    setSelectedTaxGroupIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDeleteTaxGroups = () => {
    if (selectedTaxGroupIds.length === 0) {
      showToast.info(t("common.select_delete"));
      return;
    }
    setIsTaxConfirmDialogOpen(true);
  };

  const handleCancelTaxDelete = () => {
    setIsTaxConfirmDialogOpen(false);
  };

  const confirmTaxDelete = async () => {
    if (selectedTaxGroupIds.length !== 0) {
      try {
        setIsDeleting(true);
        // Delete all selected tax groups
        selectedTaxGroupIds.forEach((id) => {
          handleDeleteTaxGroup(id);
        });
        setIsTaxConfirmDialogOpen(false);
        setSelectedTaxGroupIds([]);
        setIsDeleting(false);
      } catch (error) {
        setIsDeleting(false);
        showToast.error(error?.message || t("dashboard.error"));
        console.error("Error deleting tax groups:", error);
      }
    }
  };

  // Final submission handler
  const handleFinalSubmit = async () => {
    try {
      // Validation before submission
      if (!countryData) {
        showToast.error(t("countries.validation.countryInfoRequired"));
        setModalStep(1);
        return;
      }

      if (countryCities.length === 0) {
        showToast.error(t("cities.validation.noCitiesAdded"));
        setModalStep(2);
        return;
      }

      if (!selected) {
        showToast.error(t("currencies.validation.currencyRequired"));
        setModalStep(3);
        return;
      }

      if (countryTaxGroups.length === 0) {
        showToast.error(t("taxes.validation.noTaxGroupsAdded"));
        return;
      }

      // Upload flag image if it exists
      let flagImageId = countryData.flagId;

      if (countryData.flagId && countryData.flagId instanceof File) {
        try {
          console.log("Uploading flag image:", countryData.flagId);
          const uploadResponse = await uploadImage(countryData.flagId);

          flagImageId = uploadResponse?.result.id;

          console.log("Flag uploaded successfully:", uploadResponse);
        } catch (uploadError) {
          showToast.error("Failed to upload flag image");
          console.error("Flag upload error:", uploadError);
          return;
        }
      }

      // Update countryData with the uploaded flag ID
      const updatedCountryData = {
        ...countryData,
        flagId: flagImageId,
      };

      // Transform data to match backend structure
      const transformedData = transformData(
        updatedCountryData,
        countryCities,
        selected,
        countryTaxGroups,
        exchangeRates,
        currencies
      );

      console.log("Submitting data to backend:", transformedData);

      // Dispatch action to create country configuration
      await dispatch(createCountriesConfig(transformedData))
        .unwrap()
        .then(() => {
          showToast.success(t("countries.createSuccess"));
          toggleModal(); // Close modal and reset state
          dispatch(fetchAllCountries())
            .unwrap()
            .then((result) => {
              dispatch(
                getCountriesConfig(result?.items[result?.items.length - 1]?.id)
              );
            })
            .catch((error) => {
              showToast.error("Failed to fetch countries");
              console.error("Error fetching countries:", error);
            });
        })
        .catch((error) => {
          showToast.error(error?.message || t("dashboard.error"));
          console.error("Failed to create country configuration:", error);
        });
    } catch (error) {
      showToast.error(error?.message || t("dashboard.error"));
      console.error("Error in final submission:", error);
    }
  };

  const handleEditCountry = () => {
    if (!item || !selectedCountryId) {
      showToast.error("No country selected to edit");
      return;
    }

    console.log("Editing country with ID:", selectedCountryId, "Country data:", item);
    // Prefill form with existing country data
    const countryInfo = item;
    reset({
      regionId: countryInfo.regionId || "",
      nameEn: countryInfo.name_i18n?.en || countryInfo.name || "",
      nameAr: countryInfo.name_i18n?.ar || "",
      countryCode: countryInfo.countryCode || "",
      countryCodeNumeric: countryInfo.countryCodeNumeric || 0,
      phoneCode: countryInfo.phoneCode || "",
      flagId: countryInfo.flagId || null,
      codeEnabled: countryInfo.codeEnabled || false,
      bnplEnabled: countryInfo.bnplEnabled || false,
      defaultLanguage: countryInfo.defaultLanguage || "",
    });

    // Set image preview if flag exists
    if (countryInfo.flagId) {
      setImageEditPreview(`${imageUrl}${countryInfo.flagId}`);
    }

    // Open modal in edit mode
    setIsEditMode(true);
    setModalOpen(true);
    setModalStep(1);
  };

  const handleEditSubmit = async (data) => {
    try {
      if (!selectedCountryId) {
        showToast.error("No country selected to update");
        return;
      }

      // Upload flag image if a new file was selected
      let flagImageId = data.flagId;

      if (data.flagId && data.flagId instanceof File) {
        try {
          console.log("Uploading new flag image:", data.flagId);
          const uploadResponse = await uploadImage(data.flagId);
          flagImageId = uploadResponse?.result.id;
          console.log("Flag uploaded successfully:", uploadResponse);
        } catch (uploadError) {
          showToast.error("Failed to upload flag image");
          console.error("Flag upload error:", uploadError);
          return;
        }
      }

      // Prepare update data
      const updateData = {
        countryCode: data.countryCode || "",
        countryCodeNumeric: data.countryCodeNumeric || 0,
        name: data.nameEn || "",
        name_i18n: {
          en: data.nameEn || "",
          ar: data.nameAr || "",
        },
        regionId: data.regionId || "",
        phoneCode: data.phoneCode || "",
        codeEnabled: data.codeEnabled ?? false,
        bnplEnabled: data.bnplEnabled ?? false,
        flagId: flagImageId || "",
        defaultLanguage: item.defaultLanguage || "",
        status: item?.status,
        locale: item?.locale,
        taxable: item?.taxable,
      };

      // If defaultCurrencyId exists, include it
      if (item?.defaultCurrencyId) {
        updateData.defaultCurrencyId = item.defaultCurrencyId;
      }

      // Dispatch update action
      await dispatch(
        updateCountry({
          countryData: updateData,
          countryId: selectedCountryId,
        })
      )
        .unwrap()
        .then(() => {
          showToast.success("Country updated successfully");
          dispatch(getCountriesConfig(selectedCountryId));
          toggleModal();
        })
        .catch((error) => {
          showToast.error(error?.message || "Failed to update country");
          console.error("Failed to update country:", error);
        });
    } catch (error) {
      showToast.error(error?.message || "Failed to update country");
      console.error("Error updating country:", error);
    }
  };

  const handleEditCities = () => {
    if (!item || !selectedCountryId) {
      showToast.error("No country selected to edit");
      return;
    }

    // Load existing cities from item
    const existingCities = item.cities || [];

    // Transform cities to match the local state format
    const transformedCities = existingCities.map((city) => ({
      id: city.id,
      cityNameEn: city.name_i18n?.en || city.name || "",
      cityNameAr: city.name_i18n?.ar || "",
      cityCode: city.cityCode || "",
      countryId: selectedCountryId,
      latitude:
        city.latitude && city.longitude
          ? `${city.latitude},${city.longitude}`
          : "",
      isCapital: city.isCapital || false,
      status: city.status || "ACTIVE",
    }));

    setCountryCities(transformedCities);

    // Set country data for display
    setCountryData({
      nameEn: item.name_i18n?.en || item.name || "",
      nameAr: item.name_i18n?.ar || "",
      countryCode: item.countryCode || "",
      phoneCode: item.phoneCode || "",
      flagId: item.flagId || null,
    });

    // Set image preview if flag exists
    if (item.flagId) {
      setImagePreview(`${imageUrl}${item.flagId}`);
    }

    // Open modal in edit cities mode
    setIsEditCitiesMode(true);
    setModalOpen(true);
    setModalStep(2);
  };

  const handleEditTax = () => {
    if (!item || !selectedCountryId) {
      showToast.error("No country selected to edit");
      return;
    }

    // Load existing tax groups from item
    const existingTaxGroups = item.taxGroups || [];

    // Transform tax groups to match the local state format
    const transformedTaxGroups = existingTaxGroups.map((group) => ({
      id: group.id,
      taxGroupCode: group.taxGroupCode || "",
      status: group.status || "ACTIVE",
      taxes: [
        {
          nameEn: group.name_i18n?.en || group.name || "",
          nameAr: group.name_i18n?.ar || "",
          rate: group.rate || "",
          isDefault: group.isDefault || false,
          status: group.status || "ACTIVE",
        },
      ],
    }));

    setCountryTaxGroups(transformedTaxGroups);

    // Set country data for display
    setCountryData({
      nameEn: item.name_i18n?.en || item.name || "",
      nameAr: item.name_i18n?.ar || "",
      countryCode: item.countryCode || "",
      phoneCode: item.phoneCode || "",
      flagId: item.flagId || null,
    });

    // Set image preview if flag exists
    if (item.flagId) {
      setImagePreview(`${imageUrl}${item.flagId}`);
    }

    // Open modal in edit tax mode
    setIsEditTaxMode(true);
    setModalOpen(true);
    setModalStep(5);
  };

  const handleEditCurrency = () => {
    if (!item || !selectedCountryId) {
      showToast.error("No country selected to edit");
      return;
    }

    // Load existing exchange rates from item
    const existingExchangeRates = item.exchangeRates || [];

    // Transform exchange rates to match the local state format
    const transformedExchangeRates = {};
    existingExchangeRates.forEach((rate) => {
      transformedExchangeRates[rate.toCurrencyId] = rate.fxRate;
    });

    setExchangeRates(transformedExchangeRates);
    setEditableExchangeRates({});

    // Set the default currency
    setSelected(item.defaultCurrencyId || "");

    // Set country data for display
    setCountryData({
      nameEn: item.name_i18n?.en || item.name || "",
      nameAr: item.name_i18n?.ar || "",
      countryCode: item.countryCode || "",
      phoneCode: item.phoneCode || "",
      flagId: item.flagId || null,
    });

    // Set image preview if flag exists
    if (item.flagId) {
      setImagePreview(`${imageUrl}${item.flagId}`);
    }

    // Open modal in edit currency mode
    setIsEditCurrencyMode(true);
    setModalOpen(true);
    setModalStep(3);
  };

  const handleSaveExchangeRates = async () => {
    try {
      if (!selectedCountryId) {
        showToast.error("No country selected");
        return;
      }

      // Get existing exchange rates to find their IDs
      const existingExchangeRates = item.exchangeRates || [];

      // Update each modified exchange rate
      const updatePromises = Object.entries(exchangeRates).map(
        async ([currencyId, fxRate]) => {
          // Find the currency from the currencies array
          const currency = currencies.find((c) => c.id === currencyId);
          if (!currency) {
            console.error(`Currency not found for ID: ${currencyId}`);
            return;
          }

          // Find the existing exchange rate record
          const existingRate = existingExchangeRates.find(
            (rate) => rate.toCurrencyId === currencyId
          );

          if (existingRate) {
            const exchangeRateData = {
              toCurrencyId: currency.id,
              fxRate: parseFloat(fxRate) || 0,
              fxRateDate: new Date().toISOString(),
              source: "MANUAL",
              status: "ACTIVE",
              countryId: selectedCountryId,
              fromCurrencyId: selected,
            };
            console.log("Updating exchange rate:", exchangeRateData);
            return dispatch(
              updateExchangeRate({
                exchangeRateId: existingRate.id,
                exchangeRateData,
              })
            ).unwrap();
          }
        }
      );

      await Promise.all(updatePromises)
        .then(() => {
          showToast.success("Exchange rates updated successfully");
          dispatch(getCountriesConfig(selectedCountryId));
          toggleModal();
        })
        .catch((error) => {
          showToast.error(error?.message || "Failed to update exchange rates");
        });
    } catch (error) {
      showToast.error(error?.message || "Failed to update exchange rates");
      console.error("Error updating exchange rates:", error);
    }
  };

  const handleStatusChange = async (country) => {
    await dispatch(
      updateCountry({
        countryData: {
          ...country,
          status: country.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
        },
        countryId: country.id,
      })
    )
      .unwrap()
      .then(() => {
        dispatch(getCountriesConfig(country.id));
        showToast.success("Country status updated successfully");
      })
      .catch((error) => {
        showToast.error(error?.message || "Failed to update country status");
      });
  };
console.log("allCountriesList feom config",allCountriesList)
  return (
    <>
      <ConfirmDialog
        open={isConfirmDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={confirmDelete}
        title={t("users.delete_dialog_title", { name: t("cities.title") })}
        message={t("users.delete_dialog_message", {
          name: t("cities.title"),
        })}
        confirmText={t("users.delete_confirm")}
        cancelText={t("users.delete_cancel")}
        confirmColor="error"
        loading={isDeleting}
      />
      <ConfirmDialog
        open={isTaxConfirmDialogOpen}
        onClose={handleCancelTaxDelete}
        onConfirm={confirmTaxDelete}
        title={t("users.delete_dialog_title", { name: "Tax Group" })}
        message={t("users.delete_dialog_message", {
          name: "Tax Group",
        })}
        confirmText={t("users.delete_confirm")}
        cancelText={t("users.delete_cancel")}
        confirmColor="error"
        loading={isDeleting}
      />
      <div className="main-country-wrapper">
        <div className="country-wrapper">
          <div className="country-left flex-between-column">
            <div>
              <h2 className="section-title">Country Specification</h2>
              <p className="countery-left-par">
                Configure and edit country specifications, including cities,
                currency, tax, payments, customs, and shipping options.
              </p>

              <CountryFlagSelect
                label="Country"
                countries={allCountriesList || []}
                imageBaseUrl={imageUrl}
                value={selectedCountryId}
                onChange={setSelectedCountryId}
                placeholder="Select a country"
              />
            </div>
            <div className="parent-container">
              <div className="add-country">
                <p>Add More Country To Platform</p>
                <span className="add-link" onClick={toggleModal}>
                  Configure New Country
                  <img
                    src={arrowupIcon}
                    alt=""
                    style={{ width: 16, marginLeft: 5 }}
                  />
                </span>
              </div>
            </div>
          </div>

          <div className="divider" />

          <div className="country-right">
            <div className="tabs">
              {[
                "Country-info",
                "Cities",
                "Currency",
                "Payment method",
                "Tax system",
              ].map((tab) => (
                <button
                  key={tab}
                  className={activeTab === tab ? "tab active" : "tab"}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.replace("-", " ")}
                </button>
              ))}
            </div>

            {activeTab === "Country-info" && (
              <CountryInfoDisplay
                countryData={item}
                onEdit={handleEditCountry}
                handleStatusChange={handleStatusChange}
              />
            )}

            {activeTab === "Cities" && (
              <CitiesInfo
                countryData={item}
                onEdit={handleEditCities}
                getCountriesConfig={getCountriesConfig}
                handleStatusChange={handleStatusChange}
              />
            )}

            {activeTab === "Currency" && (
              <CurrencyInfo
                countryData={item}
                currencies={currencies}
                onEdit={handleEditCurrency}
                handleStatusChange={handleStatusChange}
              />
            )}

            {activeTab === "Payment method" && (
              <PaymentMethod
                countryData={item}
                onEdit={() => {}}
                handleStatusChange={handleStatusChange}
              />
            )}

            {activeTab === "Tax system" && (
              <TaxSystemInfo
                countryData={item}
                onEdit={handleEditTax}
                getCountriesConfig={getCountriesConfig}
                handleStatusChange={handleStatusChange}
              />
            )}
          </div>
        </div>

        {modalOpen && (
          <div className="modal-overlay-platform">
            <div className="modal-drawer">
              <button className="close-btn" onClick={toggleModal}>
                ✕
              </button>

              <h2 className="modal-title">
                {isEditMode
                  ? "Edit Country Info"
                  : isEditCitiesMode
                  ? "Edit Cities"
                  : isEditTaxMode
                  ? "Edit Tax System"
                  : isEditCurrencyMode
                  ? "Edit Currency"
                  : "Configure New Country"}
              </h2>
              <p className="modal-overlay-subtitle">
                {isEditMode
                  ? "Update country information and settings."
                  : isEditCitiesMode
                  ? "Manage cities for this country."
                  : isEditTaxMode
                  ? "Manage tax groups for this country."
                  : isEditCurrencyMode
                  ? "Update exchange rates for this country."
                  : "Configure country specifications, including cities, currency, tax, payments, customs, & shipping options."}
              </p>

              <div className="divider" />

              {!isEditMode &&
                !isEditCitiesMode &&
                !isEditTaxMode &&
                !isEditCurrencyMode && (
                  <div className="modal-tabs">
                    <div
                      className={`modal-tab ${modalStep === 1 ? "active" : ""}`}
                    >
                      <span>Country Info</span>
                    </div>

                    <div
                      className={`modal-tab ${modalStep === 2 ? "active" : ""}`}
                    >
                      <span>Add Cities</span>
                    </div>

                    <div
                      className={`modal-tab ${modalStep === 3 ? "active" : ""}`}
                    >
                      <span>Currency</span>
                    </div>

                    <div
                      className={`modal-tab ${modalStep === 4 ? "active" : ""}`}
                    >
                      <span>Payment method</span>
                    </div>
                    <div
                      className={`modal-tab ${modalStep === 5 ? "active" : ""}`}
                    >
                      <span>Tax System</span>
                    </div>
                  </div>
                )}

              {modalStep === 1 && (
                <>
                  <h3 style={{ marginTop: "30px" }} className="form-title">
                    {isEditMode ? "Edit Country Info" : "Add New Country Info"}
                  </h3>

                  <CountryInfoInputs
                    regions={regions}
                    control={control}
                    errors={errors}
                    watch={watch}
                    setValue={setValue}
                    setImagePreview={setImagePreview}
                    imageEditPreview={imageEditPreview}
                    isEditMode={isEditMode}
                  />

                  <div className="modal-footer">
                    {isEditMode ? (
                      <>
                        <button
                          className="next-btn"
                          onClick={handleSubmit(handleEditSubmit)}
                        >
                          {"Update Countery" || "Save"}
                        </button>
                        <button className="prev-btn" onClick={toggleModal}>
                          {t("common.cancel") || "Cancel"}
                        </button>
                      </>
                    ) : (
                      <button className="next-btn" onClick={handleNext}>
                        Next
                      </button>
                    )}
                  </div>
                </>
              )}

              {modalStep === 2 && (
                <div className="modalStepTwo">
                  <h3 className="form-title step-two-title">Country Info</h3>
                  {countryData && (
                    <div className="country-info-row">
                      <div className="country-left">
                        <img
                          src={imagePreview}
                          alt="Flag preview"
                          style={{
                            width: "40px",
                            height: "30px",
                            objectFit: "cover",
                            borderRadius: "4px",
                            border: "1px solid #ddd",
                          }}
                        />
                        <span className="country-name">
                          {countryData.nameEn}
                        </span>
                      </div>

                      <span className="country-ar">{countryData.nameAr}</span>
                      <span className="country-code">
                        {countryData.countryCode}
                      </span>
                      <span className="country-phone">
                        {countryData.phoneCode}
                      </span>
                    </div>
                  )}
                  <h4 className="main-section-title">Add Cities</h4>
                  <div className="flex-between">
                    <h4 className="section-title">Add Cities To Country</h4>
                    <span className="delete-action" onClick={handleDelete}>
                      <Trash style={{ margin: "4px" }} />
                      <span
                        style={{
                          fontSize: "14px",
                        }}
                        className="delete-button-drawer"
                      >
                        {t("common.delete")}
                      </span>
                    </span>
                  </div>
                  <div className="cities-wrapper">
                    <div className="cities-header">
                      <span></span>
                      <span>Name</span>
                      <span>Code</span>
                      <span>Capital</span>
                      <span>Status</span>
                      <span>Actions</span>
                    </div>
                    <div className="cities-scrollable">
                      {countryCities.length > 0 ? (
                        countryCities.map((city) => (
                          <div key={city.id} className="cities-row">
                            <span>
                              <input
                                type="checkbox"
                                value={city.id}
                                checked={selectedIds.includes(city.id)}
                                onChange={() => handleSelectIds(city.id)}
                              />
                            </span>
                            <span>
                              {city.cityNameEn} / {city.cityNameAr}
                            </span>
                            <span>{city.cityCode || "--"}</span>
                            <span>{city.isCapital ? "Yes" : "No"}</span>
                            <span className="status-cell">
                              <CustomSwitch
                                checked={city.status === "ACTIVE"}
                                onChange={() => handleToggleCityStatus(city.id)}
                              />
                              <span
                                className={
                                  city.status === "ACTIVE"
                                    ? "status-active"
                                    : "status-inactive"
                                }
                              >
                                {city.status === "ACTIVE"
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </span>
                            <span className="edit-icon">
                              <EditIcon
                                style={{
                                  cursor: "pointer",
                                  marginRight: "10px",
                                }}
                                onClick={() => handleEditCity(city)}
                              />
                            </span>
                          </div>
                        ))
                      ) : (
                        <div
                          style={{
                            padding: "20px",
                            textAlign: "center",
                            color: "#666",
                          }}
                        >
                          No cities added yet. Click "Add city" to add your
                          first city.
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEditingCity(null);
                      setOpenCities(true);
                    }}
                    className="add-city-btn"
                  >
                    <AddIcon
                      style={{
                        color: "#2BA9A8",
                        fontSize: "22px",
                      }}
                    />
                    Add city
                  </button>
                  <div className="modal-footer">
                    {isEditCitiesMode ? (
                      <button className="next-btn" onClick={toggleModal}>
                        {"Update City" || "Done"}
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleNextPayment}
                          className="next-btn"
                        >
                          Next Step
                        </button>
                        <button onClick={handlePrevious} className="prev-btn">
                          Previous
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {modalStep === 3 && (
                <>
                  <div className="continer-modal">
                    {!isEditCurrencyMode && (
                      <div className="modalStepTwo">
                        <h3 className="form-title">Country Info</h3>
                        <div className="country-info-row">
                          <div className="country-left">
                            <img
                              src={imagePreview}
                              alt="Flag preview"
                              style={{
                                width: "40px",
                                height: "30px",
                                objectFit: "cover",
                                borderRadius: "4px",
                                border: "1px solid #ddd",
                              }}
                            />
                            <span className="country-name">
                              {countryData.nameEn}
                            </span>
                          </div>

                          <span className="country-ar">
                            {countryData.nameAr}
                          </span>
                          <span className="country-code">
                            {countryData.countryCode}
                          </span>
                          <span className="country-phone">
                            {countryData.phoneCode}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="currency-wrapper">
                      <label
                        style={{ marginTop: "2rem" }}
                        className="currency-title"
                      >
                        Currency
                      </label>

                      <div className="currency-subtitle">
                        <span>Select Currency</span>
                        <Information />
                      </div>

                      <div className="select-container">
                        <select
                          value={selected}
                          onChange={(e) => setSelected(e.target.value)}
                          disabled={isEditCurrencyMode}
                          style={
                            isEditCurrencyMode
                              ? { opacity: 0.6, cursor: "not-allowed" }
                              : {}
                          }
                        >
                          <option value="" disabled>
                            Select Currency
                          </option>

                          {currencies.map((currency) => (
                            <option key={currency.id} value={currency.id}>
                              {currency.name}
                            </option>
                          ))}
                        </select>

                        <KeyboardArrowDownIcon className="select-arrow" />
                      </div>
                    </div>

                    <div className="exchange-rate-section">
                      <h2 className="exchange-rate-title">Exchange Rate</h2>
                      <p className="exchange-rate-subtitle">
                        Specify the Exchange Rate Of The Selected Currency
                        Against Other Currencies
                      </p>

                      <div className="exchange-rate-table">
                        <div
                          className={`exchange-rate-header ${
                            isEditCurrencyMode ? "" : "add"
                          }`}
                        >
                          <span>Currency ID</span>
                          <span>Previous</span>
                          <span>Current value</span>
                        </div>

                        <div className="exchange-rate-body">
                          {currencies
                            .filter((cur) => cur.id !== selected)
                            .map((currency) => (
                              <div
                                key={currency?.id}
                                className={`exchange-rate-row ${
                                  isEditCurrencyMode ? "" : "add"
                                }`}
                              >
                                <span className="column-currency-id">
                                  {currency.currencyCode?.length > 10
                                    ? `${currency.currencyCode.slice(0, 10)}...`
                                    : currency.currencyCode}
                                </span>
                                <span className="column-previous">{exchangeRates[currency.id]||'0'}</span>
                                <input
                                  type="number"
                                  className="column-current"
                                  step="0.000001"
                                  min="0"
                                  value={exchangeRates[currency.id] || ""}
                                  onChange={(e) =>
                                    handleExchangeRateChange(
                                      currency.id,
                                      e.target.value
                                    )
                                  }
                                  placeholder="0.00"
                                  disabled={
                                    isEditCurrencyMode &&
                                    !editableExchangeRates[currency.id]
                                  }
                                  style={
                                    isEditCurrencyMode &&
                                    !editableExchangeRates[currency.id]
                                      ? { opacity: 0.6, cursor: "not-allowed" }
                                      : {}
                                  }
                                />
                                <span className="column-action">
                                  {isEditCurrencyMode && (
                                    <button
                                      className="edit-value-btn"
                                      onClick={() =>
                                        toggleEditableExchangeRate(currency.id)
                                      }
                                      type="button"
                                    >
                                      <EditIcon
                                        style={{
                                          width: "16px",
                                          height: "16px",
                                          marginRight: "6px",
                                        }}
                                      />
                                      {editableExchangeRates[currency.id]
                                        ? "Lock"
                                        : "Edit"}{" "}
                                      Value
                                    </button>
                                  )}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>

                    <div className="modal-footer">
                      {isEditCurrencyMode ? (
                        <>
                          <button
                            className="next-btn"
                            onClick={handleSaveExchangeRates}
                          >
                            {"Update Currency" || "Save"}
                          </button>
                          <button className="prev-btn" onClick={toggleModal}>
                            {t("common.cancel") || "Cancel"}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={handleNextCurrency}
                            className="next-btn"
                          >
                            Next Step
                          </button>
                          <button
                            onClick={() => setModalStep(2)}
                            className="prev-btn"
                          >
                            Previous
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
              {modalStep === 4 && (
                <>
                  <div className="continer-modal">
                    <div className="modalStepTwo">
                      <h3 className="form-title">Country Info</h3>
                      <div className="country-info-row">
                        <div className="country-left">
                          <img
                            src={imagePreview}
                            alt="Flag preview"
                            style={{
                              width: "40px",
                              height: "30px",
                              objectFit: "cover",
                              borderRadius: "4px",
                              border: "1px solid #ddd",
                            }}
                          />
                          <span className="country-name">
                            {countryData.nameEn}
                          </span>
                        </div>

                        <span className="country-ar">{countryData.nameAr}</span>
                        <span className="country-code">
                          {countryData.countryCode}
                        </span>
                        <span className="country-phone">
                          {countryData.phoneCode}
                        </span>
                      </div>
                    </div>
                    <div className="container-payment-method">
                      <h2>Payment Methods</h2>
                      <p>
                        Select the payment methods you want to enable for this
                        country.
                      </p>

                      <div className="cities-wrapper">
                        <div className="cities-header">
                          <span>
                            <input type="checkbox" />
                            Payment
                          </span>
                          <span>Fee (%)</span>

                          <span>Status</span>
                        </div>

                        <div className="cities-row">
                          <span>
                            <input type="checkbox" />
                            PAYPAL
                          </span>
                          <span>1%</span>

                          <span className="status-cell">
                            <CustomSwitch checked />
                            <span className="status-active">Active</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="other-payment-methods">
                      <div className="flex-between">
                        <span className="other-meth-span">
                          Cash on Delivery
                        </span>
                        <CustomSwitch
                          checked={watch("codeEnabled") || false}
                          onChange={(e) =>
                            setValue("codeEnabled", e.target.checked)
                          }
                        />
                      </div>
                      <div className="flex-between">
                        <span className="other-meth-span">BNPL</span>
                        <CustomSwitch
                          checked={watch("bnplEnabled") || false}
                          onChange={(e) =>
                            setValue("bnplEnabled", e.target.checked)
                          }
                        />
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        onClick={() => {
                          setModalStep(5);
                        }}
                        className="next-btn"
                      >
                        Next Step
                      </button>
                      <button
                        onClick={handlePreviousPayment}
                        className="prev-btn"
                      >
                        Previous
                      </button>
                    </div>
                  </div>
                </>
              )}

              {modalStep === 5 && (
                <>
                  <div className="continer-modal">
                    <div className="modalStepTwo">
                      <h3 className="form-title step-four-tax">Country Info</h3>
                      <div className="country-info-row">
                        <div className="country-left">
                          <img
                            src={imagePreview}
                            alt="Flag preview"
                            style={{
                              width: "40px",
                              height: "30px",
                              objectFit: "cover",
                              borderRadius: "4px",
                              border: "1px solid #ddd",
                            }}
                          />
                          <span className="country-name">
                            {countryData.nameEn}
                          </span>
                        </div>

                        <span className="country-ar">{countryData.nameAr}</span>
                        <span className="country-code">
                          {countryData.countryCode}
                        </span>
                        <span className="country-phone">
                          {countryData.phoneCode}
                        </span>
                      </div>
                    </div>

                    <div className="tax-container">
                      <h2 className="tax-title">create Tax system  </h2>
                      <div className="tax-subtitle">
                        <p>Add Tax Group</p>

                        <div
                          style={{ cursor: "pointer" }}
                          onClick={handleDeleteTaxGroups}
                        >
                          <Trash />
                          <span>Delete</span>
                        </div>
                      </div>
                    </div>
                    <div className="tax-wrapper">
                      <div className="table-header-row">
                        <div className="col-left">
                          <input type="checkbox" />
                          <span>Group Code</span>
                        </div>
                        <span className="col-status">Statuses</span>
                        <span className="col-edit">Edit</span>
                      </div>
                      <div className="cities-scrollable">
                        {countryTaxGroups.length > 0 &&
                          countryTaxGroups.map((group) => (
                            <div key={group.id} className="group-box">
                              <div className="group-row">
                                <div className="col-left">
                                  <input
                                    type="checkbox"
                                    checked={selectedTaxGroupIds.includes(
                                      group.id
                                    )}
                                    onChange={() =>
                                      handleSelectTaxGroupIds(group.id)
                                    }
                                  />
                                  <span>{group.taxGroupCode}</span>
                                </div>
                                <div className="col-status">
                                  <CustomSwitch
                                    checked={group.status === "ACTIVE"}
                                    onChange={() =>
                                      handleToggleTaxGroupStatus(group.id)
                                    }
                                  />
                                  <span
                                    className={
                                      group.status === "ACTIVE"
                                        ? "status-active"
                                        : "status-inactive"
                                    }
                                  >
                                    {group.status === "ACTIVE"
                                      ? "Active"
                                      : "Inactive"}
                                  </span>
                                </div>
                                <div className="col-edit">
                                  <EditIcon
                                    style={{ cursor: "pointer" }}
                                    onClick={() => handleEditTaxGroup(group)}
                                  />
                                </div>
                              </div>
                              <div className="tax-table">
                                <div className="tax-head">
                                  <span>Tax Name</span>
                                  <span>Tax Rate</span>
                                  <span>Default</span>
                                </div>

                                <div className="tax-row">
                                  {group.taxes.map((tax) => {
                                    return (
                                      <>
                                        <span>{tax.nameEn}</span>
                                        <span>{tax.rate}</span>
                                        <span>
                                          {tax.isDefault ? "Yes" : "No"}
                                        </span>
                                      </>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div className="modal-footer">
                      <button
                        type="button"
                        style={{
                          marginBottom: "10px",
                        }}
                        className="add-tax-entry-btn"
                        onClick={() => setOpenTaxModal(true)}
                      >
                        <AddIcon fontSize="small" className="add-tax-icon" />
                        {t("taxes.modal.addTaxButton")}
                      </button>
                      {isEditTaxMode ? (
                        <button className="next-btn" onClick={toggleModal}>
                          {"Update Tax Group" || "Done"}
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={handleFinalSubmit}
                            className="next-btn"
                          >
                            {t("common.submit")}
                          </button>
                          <button
                            onClick={() => {
                              setModalStep(4);
                            }}
                            className="prev-btn"
                          >
                            Previous
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {openCities && (
          <>
            <div
              className="drawer-overlay"
              onClick={() => {
                setOpenCities(false);
                setEditingCity(null);
              }}
            />
            <CitiesDrawer
              onClose={() => {
                setOpenCities(false);
                setEditingCity(null);
              }}
              mode={editingCity ? "edit" : "create"}
              editData={editingCity}
              onCityAdded={handleCityAdded}
              onCityUpdated={handleCityUpdated}
            />
          </>
        )}

        <TaxGroupModal
          open={openTaxModal}
          onClose={() => {
            setOpenTaxModal(false);
            setEditingTaxGroup(null);
          }}
          mode={editingTaxGroup ? "edit" : "create"}
          editData={editingTaxGroup}
          onTaxGroupAdded={handleTaxGroupAdded}
          onTaxGroupUpdated={handleTaxGroupUpdated}
        />
      </div>
    </>
  );
};

export default ConfigureCountry;
