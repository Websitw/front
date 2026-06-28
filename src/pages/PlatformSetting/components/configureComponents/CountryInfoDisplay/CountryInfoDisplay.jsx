import React from "react";
import CustomSwitch from "../../../../../components/common/CustomSwitch";
import { imageUrl } from "../../../../../helper/helper";
import { useTranslation } from "react-i18next";
import "./CountryInfoDisplay.css";
import { DefaultFalg } from "../../../../../assets/image";
import { EditIcon } from "../../../../../assets/icons";
import "./CountryInfoDisplay.css";

const CountryInfoDisplay = ({ countryData, onEdit, handleStatusChange }) => {
  const { t } = useTranslation();

  if (!countryData) {
    return (
      <div className="empty-state">
        Please Select A Country To View The Specifications.
      </div>
    );
  }

  console.log("countryData", countryData);

  return (
    <div className="country-info-display">
      <div className="country-info-container">
        <div className="country-header">
          <div className="country-header-left">
            <img
              src={
                countryData.flagId
                  ? `${imageUrl}${countryData.flagId}`
                  : DefaultFalg
              }
              alt={countryData.name}
              className="country-flag-large"
            />
            <div className="country-names">
              <h3>
                {countryData.name
                  ? `${countryData.name} - ${countryData.name_i18n?.ar}`
                  : "-"}
              </h3>
              {/* <p className="arabic-name">{countryData.name_i18n?.ar}</p> */}
            </div>
          </div>

          {/* <div className="country-header-center">
          <span className="country-code-badge">{countryData.countryCode}</span>
        </div> */}
          <div className="country-header-right">
            {/* <span className="region-name">
            {countryData.regionName || "MENA Region"}
          </span> */}
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

      <div className="country-info-section">
        <div className="section-header">
          <h3>Country identity</h3>
          <button className="edit-btn" onClick={onEdit}>
            <EditIcon className="edit-icon" />
            Edit Country
          </button>
        </div>

        <div className="info-grid">
          <div className="info-item">
            <label>English Name :</label>
            <div className="info-value">{countryData.name_i18n?.en || "-"}</div>
          </div>

          <div className="info-item">
            <label>Region :</label>
            <div className="info-value">{countryData.regionName || "MENA"}</div>
          </div>

          <div className="info-item">
            <label>Arabic Name :</label>
            <div className="info-value">{countryData.name_i18n?.ar || "-"}</div>
          </div>

          <div className="info-item">
            <label>Phone Code :</label>
            <div className="info-value">{countryData.phoneCode || "-"}</div>
          </div>

          <div className="info-item">
            <label>Flag Image :</label>
            <div className="info-value flag-preview">
              <img
                src={
                  countryData.flagId
                    ? `${imageUrl}${countryData.flagId}`
                    : DefaultFalg
                }
                alt="Flag"
                className="flag-thumbnail"
              />
            </div>
          </div>

          <div className="info-item">
            <label>Language :</label>
            <div className="info-value">{countryData.locale || "-"}</div>
          </div>

          <div className="info-item">
            <label>Country Code :</label>
            <div className="info-value">{countryData.countryCode || "-"}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountryInfoDisplay;
