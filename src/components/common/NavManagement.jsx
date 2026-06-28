import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  Plus,
  RotateCcw,
} from "lucide-react";
import "../Admin/AdsMangment/NavbarMangment/AdsNavbar.css";

const NavManagement = ({ 
    onCreateNew, 
    onSearch, 
    onFilter, 
    onReset,
    statusFilters=[],
    typeFilters=[],
    titleCreateNew,
    title,
    subtitle,
    searchPlaceholder,
    filterTypeOneLabel,
    filterTypeTwoLabel
}) => {
  const { t } = useTranslation();
  const [activeStatusFilter, setActiveStatusFilter] = useState("all");
  const [activeTypeFilter, setActiveTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
 
  

  const handleStatusFilterClick = (value) => {
    const newFilter = activeStatusFilter === value ? "all" : value;
    setActiveStatusFilter(newFilter);
    onFilter?.({ status: newFilter, discountType: activeTypeFilter });
  };

  const handleTypeFilterClick = (value) => {
    const newFilter = activeTypeFilter === value ? "all" : value;
    setActiveTypeFilter(newFilter);
    onFilter?.({ status: activeStatusFilter, discountType: newFilter });
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleReset = () => {
    setActiveStatusFilter("all");
    setActiveTypeFilter("all");
    setSearchQuery("");
    onReset?.();
  };

  return (
    <div className="ads-navbar">
      <div className="ads-navbar-header">
        <div className="ads-navbar-title-section">
          <h1 className="ads-navbar-title">{title}</h1>
          <p className="ads-navbar-subtitle">{subtitle}</p>
        </div>

        {titleCreateNew && <button className="ads-navbar-create-btn" onClick={onCreateNew}>
          <Plus size={20} />
          <span>{titleCreateNew}</span>
        </button>
        }
      </div>

      <div className="ads-navbar-controls">
        <div className="ads-navbar-search-wrapper">
          <Search className="ads-navbar-search-icon" size={20} />
          <input
            type="text"
            className="ads-navbar-search-input"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        <div className="ads-navbar-filters-section">
          <span className="ads-navbar-filter-label">{filterTypeOneLabel}</span>
          <div className="ads-navbar-filters">
            {statusFilters.length!==0 && statusFilters.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                className={`ads-navbar-filter-btn ${activeStatusFilter === value ? "active" : ""}`}
                onClick={() => handleStatusFilterClick(value)}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            ))}
            {typeFilters.length!==0 && <span className="ads-navbar-filter-type-label">
              {filterTypeTwoLabel}
            </span>}
            {typeFilters.length!==0 && typeFilters.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                className={`ads-navbar-filter-btn ${activeTypeFilter === value ? "active" : ""}`}
                onClick={() => handleTypeFilterClick(value)}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="ads-navbar-actions">
          <button className="ads-navbar-reset-btn" onClick={handleReset}>
            <RotateCcw size={18} />
            <span>{t("promocode.reset")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NavManagement;