import React, { useEffect, useRef, useState } from "react";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import { useTranslation } from "react-i18next";
import searchIcon from "../../assets/userSidebar/English search.svg";
import icon_1 from "../../assets/userSidebar/Group 25427.svg";
import icon_2 from "../../assets/userSidebar/icon.svg";
import icon_3 from "../../assets/userSidebar/Vector.svg";
import { SmallLogo } from "../../assets/icons";
import { useNavigate } from "react-router-dom";

import BrandTooltip from "./BrandTooltip/BrandTooltip";
import "./SidebarNav.css";
import useCart from "../../hooks/useCart";

const SidebarNav = ({
  onOpenSearch,
  onOpenCart,
  onOpenAccount,
  onOpenWishlist,
  showBrandSwitch = false,
  brandTriggerRoute = "/",
}) => {
  const { cartItems } = useCart();
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const langMenuRef = useRef(null);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const currentLanguage = (i18n.resolvedLanguage || i18n.language || "en").startsWith("ar")
    ? "ar"
    : "en";
  const sidebarLandmarkLabel = currentLanguage === "ar" ? "أدوات الواجهة" : "Interface utilities";
  const languageOptions = [
    {
      code: "en",
      label: t("settings.languageOptions.english"),
      shortCode: "EN",
      direction: "ltr",
    },
    {
      code: "ar",
      label: t("settings.languageOptions.arabic"),
      shortCode: "AR",
      direction: "rtl",
    },
  ];

  useEffect(() => {
    document.documentElement.dir = currentLanguage === "ar" ? "rtl" : "ltr";
    document.body.dir = currentLanguage === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  useEffect(() => {
    if (!isLangMenuOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (langMenuRef.current?.contains(event.target)) {
        return;
      }

      setIsLangMenuOpen(false);
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsLangMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLangMenuOpen]);

  const handleLanguageChange = async (languageCode) => {
    await i18n.changeLanguage(languageCode);
    document.documentElement.dir = languageCode === "ar" ? "rtl" : "ltr";
    document.body.dir = languageCode === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = languageCode;
    setIsLangMenuOpen(false);
  };

  return (
    <aside className="sidebar-nav-user" aria-label={sidebarLandmarkLabel}>
      <div 
      onClick={()=>{
        navigate(brandTriggerRoute)
      }}
      className="sidebar-nav__brand-wrapper">
        <div className="sidebar-nav__brand-trigger">
          <SmallLogo />
        </div>
      </div>

      {showBrandSwitch && (
        <div className="sidebar-nav__mobile-switch">
          <BrandTooltip variant="mobile" />
        </div>
      )}

      <div className="sidebar-nav__icons">
        <img
          onClick={onOpenSearch}
          src={searchIcon}
          alt="search"
          className="sidebar-nav__icon"
        />
        <div
          className="sidebar-nav__cart-wrapper"
          onClick={onOpenCart}
          style={{ cursor: "pointer" }}
        >
          <img src={icon_3} alt="cart" className="sidebar-nav__icon" />
          {cartItems?.cartLines?.length > 0 && (
            <span className="sidebar-nav__cart-badge">{cartItems?.cartLines?.length}</span>
          )}
        </div>
        <img
          src={icon_1}
          alt="user"
          className="sidebar-nav__icon"
          onClick={onOpenAccount}
          style={{ cursor: "pointer" }}
        />
        <img
          src={icon_2}
          alt="wishlist"
          className="sidebar-nav__icon"
          onClick={onOpenWishlist}
          style={{ cursor: "pointer" }}
        />
      </div>

      <div className="sidebar-nav__language-wrapper">
        <div className="sidebar-nav__locale-chip" aria-hidden="true">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/c/c0/Flag_of_Jordan.svg"
            alt="Jordan"
          />
        </div>
        <div
          className={`sidebar-nav__lang-dropdown ${isLangMenuOpen ? "sidebar-nav__lang-dropdown--open" : ""}`}
          ref={langMenuRef}
        >
          <button
            type="button"
            className="sidebar-nav__lang-trigger"
            aria-label={t("settings.language")}
            aria-haspopup="menu"
            aria-expanded={isLangMenuOpen}
            onClick={() => setIsLangMenuOpen((currentState) => !currentState)}
          >
            <span className="sidebar-nav__lang-trigger-icon" aria-hidden="true">
              <LanguageRoundedIcon />
            </span>
          </button>
          <div className="sidebar-nav__lang-menu" role="menu" aria-label={t("settings.language")}>
            <span className="sidebar-nav__lang-menu-label">{t("settings.language")}</span>
            <div className="sidebar-nav__lang-menu-list">
              {languageOptions.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  className={`sidebar-nav__lang-item ${currentLanguage === option.code ? "active" : ""}`}
                  role="menuitemradio"
                  aria-checked={currentLanguage === option.code}
                  onClick={() => handleLanguageChange(option.code)}
                  lang={option.code}
                  dir={option.direction}
                >
                  <span className="sidebar-nav__lang-item-name">{option.label}</span>
                  <span className="sidebar-nav__lang-item-badge" aria-hidden="true">
                    {option.shortCode}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="sidebar-nav__flag">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/c/c0/Flag_of_Jordan.svg"
            alt="Jordan"
          />
        </div>
        <div className="sidebar-nav__country">
          Jordan
          <br />
          11235
        </div>
      </div>
    </aside>
  );
};

export default SidebarNav;
