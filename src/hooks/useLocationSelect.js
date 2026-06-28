import { useState } from "react";
import { showToast } from "../components/CustomToast/CustomToast";

const useLocationSelect = ({ setValue, validCountries, allCities }) => {
  const [showLocationModal, setShowLocationModal] = useState(false);

  const openLocationModal = () => setShowLocationModal(true);
  const closeLocationModal = () => setShowLocationModal(false);

  const handleLocationConfirm = (details) => {
    if (!details) return;

    const matchedCountry = validCountries.find(
      (c) =>
        c.isoCode2?.toUpperCase() === details.countryCode?.toUpperCase() ||
        c.countryCode?.toUpperCase() === details.countryCode?.toUpperCase()
    );

    if (!matchedCountry) {
      showToast.error("This location is not supported currently");
      return;
    }

    setValue("countryId", matchedCountry.id, { shouldValidate: true });

    const countryCities = allCities.filter(
      (c) => c.countryId === matchedCountry.id
    );

    let matchedCity = countryCities.find((c) => {
      const googleCity = details.city?.toLowerCase() || "";
      const nameEn = c.name?.toLowerCase() || "";
      const nameAr = c.name_i18n?.ar || "";
      return (
        googleCity.includes(nameEn) ||
        nameEn.includes(googleCity) ||
        googleCity.includes(nameAr)
      );
    });

    if (!matchedCity && countryCities.length > 0) {
      let minDist = Infinity;
      countryCities.forEach((c) => {
        const dLat = details.lat - c.latitude;
        const dLng = details.lng - c.longitude;
        const dist = dLat * dLat + dLng * dLng;
        if (dist < minDist) {
          minDist = dist;
          matchedCity = c;
        }
      });
    }

    if (matchedCity) {
      setValue("cityId", matchedCity.id, { shouldValidate: true });
    }

    setValue("latitude", parseFloat(details.lat.toFixed(7)), { shouldValidate: true });
    setValue("longitude", parseFloat(details.lng.toFixed(7)), { shouldValidate: true });
    setValue("address1", details.address || "", { shouldValidate: true });
  };

  return {
    showLocationModal,
    openLocationModal,
    closeLocationModal,
    handleLocationConfirm,
  };
};

export default useLocationSelect;