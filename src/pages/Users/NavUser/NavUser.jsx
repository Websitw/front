import { useTranslation } from "react-i18next";
import {
  Search,
} from "lucide-react";
import "../../AdsMangment/NavbarMangment/AdsNavbar.css";

const NavUser = ({ onSearch, searchQuery }) => {
  const { t } = useTranslation();
  
  const handleSearchChange = (e) => {
    const value = e.target.value;
    onSearch?.(value);
  };
  return (
    <>
      <div className="ads-navbar" >
        <div className="ads-navbar-header">
          <div className="ads-navbar-title-section">
            <h1 className="ads-navbar-title">{t("users.title")}</h1>
            <p className="ads-navbar-subtitle">{t("users.subtitle")}</p>
          </div>
        </div>

        <div className="ads-navbar-controls">
          <div className="ads-navbar-search-wrapper">
            <Search className="ads-navbar-search-icon" size={20} />
            <input
              type="text"
              className="ads-navbar-search-input"
              placeholder={t("users.searchPlaceholder")}
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default NavUser;
