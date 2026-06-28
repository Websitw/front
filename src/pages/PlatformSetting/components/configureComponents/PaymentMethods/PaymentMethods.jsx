import CustomSwitch from "../../../../../components/common/CustomSwitch";
import { imageUrl } from "../../../../../helper/helper";
import { useTranslation } from "react-i18next";
import { DefaultFalg } from "../../../../../assets/image";
import { EditIcon, Link as LinkIcon } from "../../../../../assets/icons";
import "./PaymentMethods.css";

const PaymentMethods = ({ countryData, onEdit, handleStatusChange }) => {
  const { t } = useTranslation();

  if (!countryData) {
    return (
      <div className="empty-state">
        Please Select A Country To View The Specifications.
      </div>
    );
  }

  // Dummy payment methods data
  const paymentMethods = [
    {
      id: 1,
      gatewayCode: "PAYPAL",
      transactionFeeFixed: "2$",
      transactionFeePercent: "1%",
      minMaxAmount: "--/--",
      settlementTime: "2 Day",
      status: "Active",
    },
  ];

  return (
    <div className="payment-methods-display">
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

      {/* Payment Methods Section */}
      <div className="payment-methods-section">
        <div className="section-header-payment-methods">
          <h3>Payment Methods</h3>
          <button className="edit-btn" onClick={onEdit}>
            <EditIcon className="edit-icon" />
            Edit Payment
          </button>
        </div>

        {/* Payment Methods Table */}
        <div className="payment-methods-table">
          <div className="table-header">
            <span className="col-gateway">Gateway Code</span>
            <span className="col-fee-fixed">Transaction Fee Fixed</span>
            <span className="col-fee-percent">Transaction Fee (%)</span>
            <span className="col-amount">Min/Max Amount</span>
            <span className="col-settlement">Settlement Time</span>
            <span className="col-status">Statuses</span>
          </div>

          {paymentMethods.map((method) => (
            <div key={method.id} className="table-row">
              <span className="col-gateway">
                <LinkIcon className="gateway-icon" />
                {method.gatewayCode}
              </span>
              <span className="col-fee-fixed">{method.transactionFeeFixed}</span>
              <span className="col-fee-percent">{method.transactionFeePercent}</span>
              <span className="col-amount">{method.minMaxAmount}</span>
              <span className="col-settlement">{method.settlementTime}</span>
              <span className="col-status">
                <span className="status-badge active">{method.status}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaymentMethods;
