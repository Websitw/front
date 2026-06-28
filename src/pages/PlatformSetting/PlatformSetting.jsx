import { useState } from "react";
import { useTranslation } from "react-i18next";
import "./PlatformSetting.css";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import RegionsDrawer from "./components/RegionsDrawer";
import CurrencyDrawer from "./components/CurrencyDrawer";
import LanguageDrawer from "./components/LanguageDrawer";
import ConfigureCountry from './components/ConfigureCountry'
import {
  createRegion,
  updateRegion,
  getRegions,
} from "../../store/slices/regionSlice";
import { useDispatch } from "react-redux";
import { ITEMS_PER_PAGE } from "../../helper/helper";
import SettingsRow from "./components/SettingsRow";
import { showToast } from "../../components/CustomToast/CustomToast";
const PlatformSetting = () => {
  const [openRegions, setOpenRegions] = useState(false);
  const [openLanguage, setOpenLanguages] = useState(false);
  const [openCurrency, setOpenCurrency] = useState(false);
  const [openCountry, setOpenCountry] = useState(false);
  const [openCities, setOpenCities] = useState(false);
  const [openExchangeRate, setOpenExchangeRate] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);

  const handleSubmit = async (data) => {
    try {
      const formData = {
        ...data,
        name_i18n:{
          en:data.name,
          ar:data.nameAr
        }
      };
      console.log("Formatted region data to submit:", formData);
      if (modalMode === "create") {
        dispatch(createRegion(formData))
          .unwrap()
          .then(() => {
            showToast.success(t("dashboard.create_success"));
          })
          .catch((error) => {
            showToast.error(error?.message || t("dashboard.error"));
          });
      } else {
        // Dispatch update action here
        dispatch(
          updateRegion({ regionId: selectedRegion.id, regionData: formData })
        )
          .unwrap()
          .then(() => {
            showToast.success(t("dashboard.update_success"));
          })
          .catch((error) => {
            showToast.error(error?.message || t("dashboard.error"));
          });
      }
      // Refresh regions list after create/update
      dispatch(
        getRegions({
          page: currentPage,
          // limit: ITEMS_PER_PAGE,
        })
      );
    } catch (error) {
      showToast.error(error?.message || t("dashboard.error"));
      console.error("Error submitting region:", error);
    }
  };
  return (
    <div className="platform-main">
      <div className="platform-container">
        <h1 className="page-title">Platform System</h1>
        <h2 className="page-subtitle">Configure Country</h2>
        {/* <div className="country-card">
          <div className="country-left">
            <h2 className="section-title">Country Specification</h2>
            <p className="section-desc">
              Configure and edit country specifications, including cities,
              currency, tax, payments, customs, and shipping options.
            </p>

            <label className="field-label">Country</label>
            <select className="country-select">
              <option>MENA - Jordan</option>
            </select>

            <div className="add-country">
              <p>Add More Country To Platform</p>
              <a href="#" className="add-link">
                Configure New Country
                <ArrowUpwardIcon
                  style={{
                    fontSize: "16px",
                    marginLeft: "5px",
                    marginTop: "5px",
                  }}
                />
              </a>
            </div>
          </div>

          <div className="divider" />
          <div className="country-right">
            <div className="right-header">
              <div>
                <h3 className="country-title">
                  MENA - Jordan <span className="status-active">Active</span>
                </h3>
              </div>
              <button className="edit-btn">Edit Country</button>
            </div>

            <div className="right-scroll">
              <div className="info-grid">
                <InfoItem
                  label="Currency"
                  value="Jordanian Dinar (JD) / US dollar (USD)"
                />
                <InfoItem label="Exchange Rate" value="1 JD = 1.41 USD" />
                <InfoItem
                  label="Payment Gateways"
                  value="Cash / Visa / Master / Paypal"
                />
                <InfoItem label="Tax Rate" value="16%" />
                <InfoItem
                  label="Customs Tariff"
                  value={<span className="link">Null</span>}
                />
                <InfoItem
                  label="Tax System"
                  value={<span className="link">(jofotara)</span>}
                />
                <InfoItem label="Shipping Companies" value="-" />
                <InfoItem label="Languages" value="-" />
              </div>
            </div>
          </div>
        </div> */}
        <ConfigureCountry/>
      </div>

      <div className="settings-section">
        <h2 className="settings-title">{t("setting.Regions & Languages")}</h2>

        <div className="settings-card">
          <SettingsRow
            title={t("sidebar.regions")}
            onClick={() => setOpenRegions(true)}
            desc={t("regions.subtitle")}
          />
          {/* <SettingsRow
            title={t("sidebar.countries")}
            desc={t("countries.subtitle")}
            onClick={() => setOpenCountry(true)}
          />
          <SettingsRow
            title={t("sidebar.cities")}
            desc={t("cities.subtitle")}
            onClick={() => setOpenCities(true)}
          /> */}
          <SettingsRow
            onClick={() => setOpenLanguages(true)}
            title={t("sidebar.languages")}
            desc={t("languages.subtitle")}
          />
        </div>
      </div>

      <div className="settings-section">
        <h2 className="settings-title">{t("setting.Finance & Payments")}</h2>

        <div className="settings-card">
          <SettingsRow
            onClick={() => setOpenCurrency(true)}
            title={t("sidebar.currencies")}
            desc={t("currencies.subtitle")}
          />
        
          <SettingsRow
            title={t("sidebar.paymentgateways")}
            desc={t("paymentgateways.subtitle")}
          />
     
        </div>
      </div>

      <div className="settings-section">
        <h2 className="settings-title">Shipping & Delivery</h2>

        <div className="settings-card">
          {/* <SettingsRow
            title="Customs Tariff"
            desc="Control tariff rules and import/export fee structures."
          /> */}
          <SettingsRow
            title="Shipping Companies"
            desc="Manage supported carriers and configure default shipping methods."
          />
          <SettingsRow
            title="Shipping & Delivery Fees"
            desc="Define delivery charges and adjust fee settings by region."
          />
        </div>
      </div>

      <div className="settings-section">
        <h2 className="settings-title">Loyalty Programs</h2>

        <div className="settings-card">
          <SettingsRow
            title="Points System"
            desc="Manage points system and customer tier levels."
          />
          <SettingsRow
            title="Rewards"
            desc="Manage customer rewards and personalized benefits across platforms."
          />
        </div>
      </div>

      {openRegions && (
        <>
          <div
            className="drawer-overlay"
            onClick={() => setOpenRegions(false)}
          />
          <RegionsDrawer
            onSubmit={handleSubmit}
            onClose={() => setOpenRegions(false)}
          />
        </>
      )}

      {openLanguage && (
        <>
          <div
            className="drawer-overlay"
            onClick={() => setOpenLanguages(false)}
          />
          <LanguageDrawer onClose={() => setOpenLanguages(false)} />
        </>
      )}

      {openCurrency && (
        <>
          <div
            className="drawer-overlay"
            onClick={() => setOpenCurrency(false)}
          />
          <CurrencyDrawer onClose={() => setOpenCurrency(false)} />
        </>
      )}

    
  
      {/* {openExchangeRate && (
        <>
          <div
            className="drawer-overlay"
            onClick={() => setOpenExchangeRate(false)}
          />
          <ExchangeRate onClose={() => setOpenExchangeRate(false)} />
        </>
      )} */}
    </div>
  );
};

const InfoItem = ({ label, value }) => {
  return (
    <div className="info-item">
      <span className="info-bar" />
      <div>
        <p className="info-label">{label} :</p>
        <p className="info-value">{value}</p>
      </div>
    </div>
  );
};

export default PlatformSetting;
