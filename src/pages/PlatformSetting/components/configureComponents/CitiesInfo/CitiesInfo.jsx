import CustomSwitch from "../../../../../components/common/CustomSwitch";
import { imageUrl } from "../../../../../helper/helper";
import { useTranslation } from "react-i18next";
import { DefaultFalg } from "../../../../../assets/image";
import { EditIcon, Location } from "../../../../../assets/icons";
import "./CitiesInfo.css";
const CitiesInfo = ({ countryData, onEdit, handleStatusChange }) => {
  const { t } = useTranslation();

  if (!countryData) {
    return (
      <div className="empty-state">
        Please Select A Country To View The Specifications.
      </div>
    );
  }

  // Extract cities from countryData
  const cities = countryData.cities || [];
  console.log("cities", cities);
  return (
    <div className="cities-info-display">
      {/* Country Header Section */}
      <div className="cities-country-container">
        <div className="cities-country-header">
          <div className="cities-country-header-left">
            <img
              src={
                countryData.flagId
                  ? `${imageUrl}${countryData.flagId}`
                  : DefaultFalg
              }
              alt={countryData.name}
              className="cities-country-flag"
            />
            <div className="cities-country-names">
              <h3>
                {countryData.name
                  ? `${countryData.name} - ${countryData.name_i18n?.ar}`
                  : "-"}
              </h3>
            </div>
          </div>

          <div className="cities-country-header-right">
           <div className="status-toggle">
            <CustomSwitch
                checked={countryData.status === "ACTIVE"}
                containerWidth={48}
                containerHeight={28}
                thumbWidth={24}
                thumbHeight={24}
                onChange={() => handleStatusChange(countryData)}
              />
              <span
                className={`status-label ${
                  countryData.status === "ACTIVE" ? "active" : ""
                }`}
              >
                {countryData.status === "ACTIVE" ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

         <div className="country-codes-info">
          <span className="code-item">
            Code : {countryData.countryCode || "-"}
          </span>
          <span className="code-item">
            Phone : {countryData.phoneCode || "-"}
          </span>
          <span className="code-item">
            Region : <span>{countryData.regionName || "MENA"}</span>
          </span>
        </div>
      </div>

      {/* Cities Section */}
      <div className="cities-info-section">
        <div className="cities-section-header">
          <h3>Cites</h3>
       <button className="edit-btn" onClick={onEdit}>
                <EditIcon className="edit-icon" />
                Edit Cities
              </button>
        </div>

        <div className="cities-table-container">
          <div className="cities-table">
            <div className="cities-table-header">
              <div className="cities-table-col">English Name</div>
              <div className="cities-table-col">Arabic Name</div>
              <div className="cities-table-col">Code</div>
              <div className="cities-table-col">Capital</div>
              <div className="cities-table-col">Location</div>
              <div className="cities-table-col">Statues</div>
            </div>
          <div className="tax-scroll">
            <div className="cities-table-body">
              {cities.length > 0 ? (
                cities.map((city, index) => (
                  <div key={city.id || index} className="cities-table-row">
                    <div className="cities-table-cell">
                      {city.name || city.name_i18n?.en || "-"}
                    </div>
                    <div className="cities-table-cell">
                      {city.name_i18n?.ar || "-"}
                    </div>
                    <div className="cities-table-cell">
                      {city.cityCode || "--"}
                    </div>
                    <div className="cities-table-cell cities-col-capital">
                      {city.isCapital ? "Yes" : "No"}
                    </div>
                    <div className="cities-table-cell cities-col-location">
                      {city.latitude && city.longitude ? (
                        <a
                          href={`https://maps.google.com/?q=${city.latitude},${city.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cities-location-link"
                        >
                          <Location />
                          Location
                        </a>
                      ) : (
                        <span className="cities-no-location">--</span>
                      )}
                    </div>
                    <div className="cities-table-cell cities-col-status">
                      <span
                        className={`cities-status-badge ${
                          city.status === "ACTIVE"
                            ? "cities-status-active"
                            : "cities-status-inactive"
                        }`}
                      >
                        {city.status === "ACTIVE" ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="cities-table-empty">
                  <p>No cities found for this country.</p>
                </div>
              )}
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitiesInfo;
