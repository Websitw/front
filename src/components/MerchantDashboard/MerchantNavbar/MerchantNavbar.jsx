import { useState } from "react";
import {
  Help,
  Messages,
  Notifcation,
  GreenSearch,
  MainLogo,
} from "../../../assets/icons";
import "./MerchantNavbar.css";

const ChevronDown = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#6B7280"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export default function MerchantNavbar() {
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="merchant-navbar-wrapper">
      <nav className="merchant-navbar">
        <div className="merchant-navbar-logo-section">
          <div className="merchant-navbar-logo">
            <MainLogo />
          </div>
          <div className="merchant-navbar-search-section">
            <div className="merchant-navbar-search-box">
              <GreenSearch />
              <input
                type="text"
                placeholder="Search for tools"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="merchant-navbar-search-input"
              />
            </div>
          </div>
        </div>

        <div className="merchant-navbar-actions-section">
          <div className="merchant-navbar-icon-group">
            <button className="merchant-navbar-icon-button" title="Help">
              <Help />
            </button>
            <button className="merchant-navbar-icon-button" title="Messages">
              <Messages />
            </button>
            <button
              className="merchant-navbar-icon-button"
              title="Notifications"
            >
              <Notifcation />
            </button>
          </div>

          <div className="merchant-navbar-divider" />

          <button className="merchant-navbar-profile-section">
            <div className="merchant-navbar-avatar">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="merchant-navbar-profile-info">
              <span className="merchant-navbar-profile-name">Mahdi Murad</span>
              <span className="merchant-navbar-profile-role">
                Administration
              </span>
            </div>
            <ChevronDown />
          </button>

          <div className="merchant-navbar-divider" />

          <div className="merchant-navbar-plan-badge">
            <span className="merchant-navbar-plan-text">Free Plan</span>
          </div>
        </div>
      </nav>
    </div>
  );
}
