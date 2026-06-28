import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import { useTranslation } from "react-i18next";
import "./DashboardLayout.css";

const DashboardLayout = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  const isRTL = currentLang === "ar";

  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = currentLang;
  }, [currentLang, isRTL]);

  return (
    <div
      className={`dashboard-container ${
        isRTL ? "dashboard-container-rtl" : "dashboard-container-ltr"
      }`}
    >
      <Sidebar />
      <main
        className={`dashboard-content ${
          isRTL ? "dashboard-content-rtl" : "dashboard-content-ltr"
        }`}
      >

        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
