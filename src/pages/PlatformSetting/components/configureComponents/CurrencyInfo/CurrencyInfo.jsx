import CustomSwitch from "../../../../../components/common/CustomSwitch";
import { imageUrl } from "../../../../../helper/helper";
import { useTranslation } from "react-i18next";
import { DefaultFalg } from "../../../../../assets/image";
import { EditIcon, Location } from "../../../../../assets/icons";
import "./CurrencyInfo.css";

const CurrencyInfo = ({ countryData, onEdit, handleStatusChange, currencies }) => {
  const { t } = useTranslation();

  if (!countryData) {
    return (
      <div className="empty-state">
        Please Select A Country To View The Specifications.
      </div>
    );
  }
 
  const exchangeRates = countryData?.exchangeRates || [];
  console.log("exchangeRates", exchangeRates);
  return (
    <div className="cities-info-display">
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

      <div className="cities-info-section">
        <div className="cities-section-header">
          <h3>Currency</h3>
          <button className="edit-btn" onClick={onEdit}>
            <EditIcon className="edit-icon" />
            Edit Currency
          </button>
        </div>

        <div className="currency-table-wrapper">
          <div className="currency-table">
            <div className="currency-table-header">
              <div className="currency-th">Currency ID</div>
              <div className="currency-th">Previous value</div>
              <div className="currency-th">Current value</div>
            </div>
              {/* {currencies.map((rate) => {
              return (
                <div className="currency-table-body">
                  <div className="currency-table-row">
                    <div className="currency-td currency-name">
                      {rate.name}
                    </div>
                    <div className="currency-td currency-prev">
                      --
                    </div>
                    <div className="currency-td currency-current">{exchangeRates.find((exchange) => exchange.toCurrencyId === rate.id)?.fxRate}</div>
                  </div>
                </div>
              );
            })} */}

            {exchangeRates.map((rate) => {
              return (
                <div className="currency-table-body">
                  <div className="currency-table-row">
                    <div className="currency-td currency-name">
                      {rate?.toCurrency?.currencyCode}
                    </div>
                    <div className="currency-td currency-prev">
                      --
                    </div>
                    <div className="currency-td currency-current">{rate.fxRate}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyInfo;
