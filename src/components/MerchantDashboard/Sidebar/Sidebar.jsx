import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Grid,
  Package,
  Menu,
  X,
  LogOut,
  StoreIcon,
  Truck,
  Banknote,
  Contact,
  Building2,
  Handshake,
  Bell,
  File,
  CreditCard,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { logout } from "../../../store/slices/authSlice";
// import "../../Admin/Sidebar/Sidebar.css";
import useLocalStorage from "../../../hooks/useLocalStorage";
import {
  Building3D,
  Group25338,
  Group25349,
  AppGear,
  CollaborationUser,
  FileCode,
  Headset,
  HomeIcon,
  BellIcon,
  PieChart,
  ProjectTemplate,
  PuzzlePiece,
  UserIcon,
  LogoGorvo,
} from "../../../assets/icons/index";
import NewSideBar from "./NewSidebar";
const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [user] = useLocalStorage("userData", null);

  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  useEffect(() => {
    document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const navItems = [
    {
      path: "/merchant/dashboard/home",
      icon: Home,
      label: t("merchant.sidebar.home"),
    },
    {
      path: "/merchant/dashboard/stores",
      icon: StoreIcon,
      label: t("merchant.sidebar.Stores"),
    },
    {
      path: "/merchant/dashboard/products",
      icon: Package,
      label: t("merchant.sidebar.products"),
    },
    {
      path: "/merchant/dashboard/categories",
      icon: Grid,
      label: t("merchant.sidebar.categories"),
    },
    {
      path: "/merchant/dashboard/shipments",
      icon: Truck,
      label: t("merchant.sidebar.shipments"),
    },
    {
      path: "/merchant/dashboard/BankDetails",
      icon: Banknote,
      label: t("merchant.sidebar.BankDetails"),
    },
    {
      path: "/merchant/dashboard/contact",
      icon: Contact,
      label: t("merchant.sidebar.contact"),
    },
    {
      path: "/merchant/dashboard/address",
      icon: Building2,
      label: t("merchant.sidebar.address"),
    },
    {
      path: "/merchant/dashboard/agreement",
      icon: Handshake,
      label: t("merchant.sidebar.agreement"),
    },
    {
      path: "/merchant/dashboard/billing",
      icon: CreditCard,
      label: t("merchant.sidebar.billing"),
    },
    {
      path: "/merchant/dashboard/document",
      icon: File,
      label: t("merchant.sidebar.document"),
    },
  ];

  const handleLogout = () => {
    dispatch(logout());
    window.dispatchEvent(new Event("authStateChanged"));
    navigate("/Signin");
  };

  return (
    <>
    <NewSideBar/>
      {/* <button
        className={`sidebar-toggle ${
          currentLang === "ar" ? "sidebar-toggle-rtl" : "sidebar-toggle-ltr"
        }`}
        onClick={toggleSidebar}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        className={`sidebar ${isOpen ? "sidebar-open" : ""} ${
          currentLang === "ar" ? "sidebar-rtl" : "sidebar-ltr"
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="sidebar-header">
          <div className="sidebar-firstSection">
            <div className="sidebar-logo">
              <LogoGorvo />
            </div>
            <div className="sidebar-title">
              <h2>{user?.name}</h2>
              <p>{user?.programCode}</p>
            </div>
          </div>
          <BellIcon />
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/dashboard"}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
              }
              onClick={() => setIsOpen(false)}
            >
              <item.icon className="sidebar-icon" size={20} />
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          ))}
          <button className="sidebar-logout" onClick={handleLogout}>
            <LogOut className="sidebar-icon" size={20} />
            <span className="sidebar-label">{t("sidebar.logout")}</span>
          </button>
        </nav>
      </aside>

      {isOpen && (
        <div
          className="sidebar-overlay overlay-visible"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )} */}
    </>
  );
};

export default Sidebar;
