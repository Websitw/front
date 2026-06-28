import CustomSwitch from "../../../../../components/common/CustomSwitch";
import { imageUrl } from "../../../../../helper/helper";
import { useTranslation } from "react-i18next";
import { DefaultFalg } from "../../../../../assets/image";
import { EditIcon } from "../../../../../assets/icons";
import "./TaxSystemInfo.css";

const TaxSystemInfo = ({ countryData, onEdit, handleStatusChange }) => {
  const { t } = useTranslation();

  if (!countryData) {
    return (
      <div className="empty-state">
        Please Select A Country To View The Specifications.
      </div>
    );
  }

  // Dummy tax groups data
  const taxGroups = countryData.taxGroups || [];
  console.log("taxGroups", taxGroups);
  return (
    <div className="tax-system-display">
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

      {/* Tax System Section */}
      <div className="tax-system-section">
        <div className="section-header">
          <h3>Tax System</h3>
          <button className="edit-btn" onClick={onEdit}>
            <EditIcon className="edit-icon" />
            Edit Tax
          </button>
        </div>

        {/* Tax Groups Container */}
        <div className="tax-groups-container">
          {/* Main Table Header */}
          <div className="tax-main-header">
            <span className="col-group-code">Group Code</span>
            <span className="col-statuses">Statues</span>
          </div>
          <div
            style={{
              maxHeight: "300px",
              overflow: "auto",
            }}
            className="tax-scroll"
          >
            {/* Tax Groups */}
            {taxGroups?.map((group) => (
              <div key={group.id} className="tax-group-box">
                {/* Group Header Row */}
                <div className="tax-group-header-row">
                  <span className="group-code-value">{group.taxGroupCode}</span>
                  <span className={`group-status ${group.status === "ACTIVE" ? "active" : "inactive"}`}>{group.status}</span>
                </div>

                {/* Nested Tax Details Table */}
                <div className="tax-details-table">
                  <div className="tax-details-header">
                    <span className="col-tax-name-en">Tax Name English</span>
                    <span className="col-tax-name-ar">Tax Name Arabic</span>
                    <span className="col-tax-rate">Tax Rate</span>
                    <span className="col-default">Default</span>
                  </div>

                  <div className="tax-details-row">
                    <span className="col-tax-name-en">
                      {group.name_i18n?.en}
                    </span>
                    <span className="col-tax-name-ar">
                      {group.name_i18n?.ar}
                    </span>
                    <span className="col-tax-rate">{group.rate}</span>
                    <span className="col-default">
                      {group.isDefault ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxSystemInfo;
