import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import { useState, useEffect } from "react";
import LanguageIcon from "@mui/icons-material/Language";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { logout } from "../../../store/slices/authSlice";
import "./Sidebar.css";
import userAccountIcon from "../../../assets/userSidebar/userAccount.svg";
import PlatFormIcon from "../../../assets/userSidebar/PlatFormIcon.svg";
import homeIcon from "../../../assets/userSidebar/home.svg";
import AnalyticsIcon from "../../../assets/userSidebar/analytics_2.svg";
import merchantIcon from "../../../assets/userSidebar/3d-building.png";
import ProductsIcon from "../../../assets/userSidebar/puzzle-piece.png";
import ordersIcon from "../../../assets/userSidebar/project-template.svg";
import supportIocn from "../../../assets/userSidebar/supportIocn.svg";
import megaPhone from "../../../assets/userSidebar/mega-phone.svg";
import ContentIcon from "../../../assets/userSidebar/ContentIcon.svg";
import userProfile from "../../../assets/userSidebar/userProfile.svg";
import customerAndLoadsIcon from "../../../assets/userSidebar/customerAndLoads.svg";

import {
  Building3D,
  HomeIcon,
  BellIcon,
  LogoGorvo,
} from "../../../assets/icons/index";
import useLocalStorage from "../../../hooks/useLocalStorage";
const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user] = useLocalStorage("userData", null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
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
    { path: "/dashboard", icon: homeIcon, label: "Dashboard" },
    {
      path: "/dashboard/Merchants",
      icon: merchantIcon,
      label: "Merchants (Sellers)",
    },

    {
      path: "/dashboard/BrandManagement",
      icon: merchantIcon,
      label: "Brand Management",
    },
    { path: "/dashboard/SegmentsMangement", icon: AnalyticsIcon, label: "Segments Mangement" },

    { path: "/dashboard/OnboardingDocuments", icon: AnalyticsIcon, label: "Onboarding Documents" },

    // OnboardingDocuments


    {
      path: "/dashboard/CategoriesManagement",
      icon: customerAndLoadsIcon,
      label: "Categories Management",
    },
    {
      path:'/dashboard/ManageAgreements',
      icon: customerAndLoadsIcon,
      label: "Manage Agreements",
    },

    {
     
      path:'/dashboard/GlobalAttributes',
      // icon:ca,
      icon: customerAndLoadsIcon,

      label: "Global Attributes",
    },
    // BrandManagement

    
    {
      path: "/dashboard/coustomer",
      icon: customerAndLoadsIcon,
      label: "Coustomer & Leads",
    },
    { path: "/dashboard/products", icon: ProductsIcon, label: "Products" },
    { path: "/dashboard/orders", icon: ordersIcon, label: "Orders Mangments" },
    { path: "/dashboard/marketing", icon: megaPhone, label: "Marketing" },
    { path: "/dashboard/support", icon: supportIocn, label: "Support" },
    { path: "/dashboard/CMS", icon: ContentIcon, label: "Content / CMS Pages" },
    {
      path: "/dashboard/platformSetting",
      icon: PlatFormIcon,
      label: t("sidebar.platformSettings"),
    },
    {
      path: "/dashboard/users",
      icon: userAccountIcon,
      label: "Users Permissions",
    },
    { path: "/dashboard/MyAccount", icon: userProfile, label: "My Account" },


    // { path: "/dashboard/users", icon: Users, label: t("sidebar.users") },
    // { path: "/dashboard/merchant", icon: Store, label: t("sidebar.merchant") },
    // {
    //   path: "/dashboard/adsmanagement",
    //   icon: Megaphone,
    //   label: t("sidebar.adsmanagement"),
    // },
    // {
    //   path: "/dashboard/promocode",
    //   icon: TicketPercent,
    //   label: t("sidebar.promocode"),
    // },
    //  {
    //   path: "/dashboard/stores",
    //   icon: StoreIcon,
    //   label: t("sidebar.stores"),
    // },
    // {
    //   path: "/dashboard/Company",
    //   icon: Building3D,
    //   label: "Companies",
    // },
    // {
    //   path: "/dashboard/brands",
    //   icon: Tags,
    //   label: t("sidebar.brands"),
    // },
    // {
    //   path: "/dashboard/countries",
    //   icon: Globe2,
    //   label: t("sidebar.countries"),
    // },
    // {
    //   path: "/dashboard/currencies",
    //   icon: Banknote,
    //   label: t("sidebar.currencies"),
    // },
    // {
    //   path: "/dashboard/taxes",
    //   icon: ReceiptText,
    //   label: t("sidebar.taxes"),
    // },
    // {
    //   path: "/dashboard/regions",
    //   icon: Route,
    //   label: t("sidebar.regions"),
    // },
    // {
    //   path: "/dashboard/Categories",
    //   icon: CategoryIcon,
    //   label: "Categories",
    // },
    // {
    //   path: "/dashboard/exchangerate",
    //   icon: Coins,
    //   label: t("sidebar.exchangerate"),
    // },

    // {
    //   path: "/dashboard/language",
    //   icon: LanguageIcon,
    //   label: "Language",
    // },
    // {
    //   path: "/dashboard/PaymentGetwaya",
    //   icon: PaymentIcon,
    //   label: "Payment gateway",
    // },
    // {
    //   path: "/dashboard/cities",
    //   icon: Globe2,
    //   label: t("sidebar.cities"),
    // },
    // {
    //   path: "/dashboard/industries",
    //   icon: Building2,
    //   label: t("sidebar.industries"),
    // },
    // {
    //   path: "/dashboard/banking",
    //   icon: CreditCard,
    //   label: t("sidebar.banking"),
    // },
    // {
    //   path: "/dashboard/business",
    //   icon: Briefcase,
    //   label: t("sidebar.business"),
    // },

    // {
    //   path: "/dashboard/TaxGroup",
    //   icon: SellIcon,
    //   label: "Tax Group",
    // },
    // {
    //   path: "/dashboard/segments",
    //   icon: Grid,
    //   label: t("sidebar.segments"),
    // },
    // {
    //   path: "/dashboard/limit",
    //   icon: Gauge,
    //   label: t("sidebar.limit"),
    // },
    // {
    //   path: "/dashboard/documentcountery",
    //   icon: File,
    //   label: t("sidebar.documentcountery"),
    // },
    // {
    //   path: "/dashboard/storeagreements",
    //   icon: Handshake,
    //   label: t("sidebar.storeagreements"),
    // },
  ];

  const handleLogout = () => {
    dispatch(logout());

    window.dispatchEvent(new Event("authStateChanged"));
    navigate("/admin");
  };

  return (
    <>
      <button
        className={`sidebar-toggle ${isOpen ? "open" : "close"} ${
          currentLang === "ar" ? "sidebar-toggle-rtl" : "sidebar-toggle-ltr"
        }`}
        onClick={toggleSidebar}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? <></> : <Menu size={24} />}
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
              <p>Administration</p>
              {/* <p>{user?.programCode}</p> */}
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
              <img
                src={item.icon}
                style={{
                  objectFit: "cover",
                  width: "16px",
                  height: "16px",
                }}
              />
              {/* <item.icon className="sidebar-icon" size={20} /> */}
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          ))}
          <button className="sidebar-logout" onClick={handleLogout}>
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
      )}
    </>
  );
};

export default Sidebar;
