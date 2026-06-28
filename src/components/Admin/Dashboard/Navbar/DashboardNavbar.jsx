import React, { useEffect, useState } from "react";
import { Bell, Settings, HelpCircle, Home, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import useLocalStorage from "../../../../hooks/useLocalStorage";
import "./DashboardNavbar.css";

export default function DashboardNavbar() {
  const { t, i18n } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [user] = useLocalStorage("userData", null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
    document.body.dir = newLang === "ar" ? "rtl" : "ltr";
  };

  return (
    <nav className="dashboard-navbar">
      <div className="navbar-left">
        <div className="user-avatar">{user ? user.name.charAt(0) : ""}</div>
        <div className="dashboard-info">
          <h1 className="dashboard-title">{t("dashboard.dashboard")}</h1>
          <p className="welcome-text">
            {t("dashboard.welcomeBack")} {user ? user.name : ""}
          </p>
          <div className="breadcrumb">
            <Home size={14} />
            <span>{t("dashboard.home")}</span>
            <ChevronRight size={14} />
            <span className="breadcrumb-current">
              {t("dashboard.dashboard")}
            </span>
          </div>
        </div>
      </div>

      <div className="navbar-right">
        <button className="icon-button" onClick={toggleLanguage}>
          <span className="lang-toggle">
            {i18n.language === "en" ? "AR" : "EN"}
          </span>
        </button>
        <button className="icon-button notification-button">
          <Bell size={20} />
          <span className="notification-badge">4</span>
        </button>
        <button className="icon-button">
          <Settings size={20} />
        </button>
        <button className="icon-button">
          <HelpCircle size={20} />
        </button>
        <div className="time-display">
          <span className="clock-icon">🕐</span>
          <span className="time-text">{formatTime(currentTime)}</span>
        </div>
      </div>
    </nav>
  );
}
