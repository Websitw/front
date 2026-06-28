import "./BrandTooltip.css";
import { Arrows } from "../../../assets/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const BrandTooltip = ({ variant = "desktop" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const pathname = location.pathname;
  const isIncludedBrand = pathname.includes("brand");
  const isMobileVariant = variant === "mobile";

  const navigateToGeneralStore = () => {
    if (!isIncludedBrand) {
      return;
    }

    navigate("/", { state: { slideDirection: -1 } });
    document.body.style.overflow = "auto";
    localStorage.setItem("isVisit", "true");
  };

  const navigateToBrandStore = () => {
    if (isIncludedBrand) {
      return;
    }

    navigate("/brand-stores", { state: { slideDirection: 1 } });
  };

  const redirectToBrandStore = () => {
    if (isIncludedBrand) {
      navigateToGeneralStore();
      return;
    }

    navigateToBrandStore();
  };

  const segments = [
    {
      id: "shop",
      label: t("storeMode.shop"),
      isActive: !isIncludedBrand,
      onClick: navigateToGeneralStore,
      ariaLabel: t("storeMode.goToShop"),
    },
    {
      id: "brands",
      label: t("storeMode.brands"),
      isActive: isIncludedBrand,
      onClick: navigateToBrandStore,
      ariaLabel: t("storeMode.goToBrands"),
    },
  ];

  if (isMobileVariant) {
    return (
      <div
        className="brand-tooltip brand-tooltip--mobile"
        role="group"
        aria-label={t("storeMode.label")}
      >
        {segments.map((segment) => (
          <button
            key={segment.id}
            type="button"
            className={`brand-tooltip__segment ${segment.isActive ? "brand-tooltip__segment--active" : ""}`}
            aria-pressed={segment.isActive}
            aria-label={segment.ariaLabel}
            onClick={segment.onClick}
          >
            {segment.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={`brand-tooltip brand-tooltip--${variant}`}
      aria-label={isIncludedBrand ? "Switch to General Store" : "Switch to Brands Store"}
      onClick={redirectToBrandStore}
    >
      <span className="brand-tooltip__copy">
        <span className="brand-text">{isIncludedBrand ? "General" : "Brand"}</span>
        <span className="brand-text">{isIncludedBrand ? "Store" : "Stores"}</span>
      </span>
      <span className="brand-arrows" aria-hidden="true">
        <Arrows />
      </span>
    </button>
  );
};

export default BrandTooltip;
