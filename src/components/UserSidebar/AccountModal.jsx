import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import EastIcon from "@mui/icons-material/East";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import {  MainLogo, MainLogoDark } from "../../assets/icons";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout, selectUser } from "../../store/slices/authSlice";
import { userCompanyStatus } from "../../store/slices/usersSlice";
import { showToast } from "../CustomToast/CustomToast";
import { useTranslation } from "react-i18next";

import "./AccountModal.css";
import { setCartItems } from "../../store/slices/cartSlice";


// src/assets/icons/darkMode_1.png 
// src/assets/icons/homeDarkMode.png 
// src/assets/icons/gift-outlineDarkMode.png 
// src/assets/icons/heartDarkMode.png





const NotificationIcon = ({ count, onClick }) => (
  <div
    className="account-modal-comp__notification"
    onClick={onClick}
    style={{ cursor: "pointer" }}
  >
    <NotificationsNoneIcon style={{ color: "#2BA9A8" }} />

    {count > 0 && (
      <span className="account-modal-comp__notification-badge">
        {count}
      </span>
    )}
  </div>
);

const ARROW_STYLE = {
  padding: "5px",
  fontSize: "24px",
  color: "#2BA9A8",
  fill: "#2BA9A8",
  borderRadius: "50px",
  border: "1px solid #2BA9A8",
};


const AccountModal = ({ isOpen, onClose, isIncludedBrand, MENU_ITEMS }) => {
  const [notificationModel, setNotificationModel] = useState(false);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = useSelector(selectUser);
  const { companyStatus } = useSelector((state) => state.users);
  const [messageCompany, setMessageCompany] = useState("");
  useEffect(() => {
    const checkCompanyStatus = async () => {
      if (!userData || !userData.id) return;
      dispatch(userCompanyStatus(userData.id)).unwrap();
    };
    checkCompanyStatus();
  }, [userData]);

  const getUserInitials = () => {
    if (!userData) return "U";
    const firstName = userData.firstName || userData.name || "";
    const lastName = userData.lastName || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U";
  };

  const handleLogout = () => {
    onClose();
    navigate("/", { replace: true });
    setTimeout(() => {
      dispatch(logout());
      dispatch(setCartItems([]));
      window.dispatchEvent(new Event("authStateChanged"));
      showToast.success(t("logged out successfully"));
    }, 0);
  };

  const handleMenuClick = (route) => {
    if (route) navigate(route);
  };

  const handleClose = () => {
    onClose();
    navigate("/");
  };

  const handleToSetting = () => {
    if (companyStatus === "ACTIVE") {
      navigate("/business-account-settings");
    } else {
      showToast.error(
        "Your company account is still pending or suspended, you cannot access business account settings"
      );
    }
  };

  const handleCheckBusinessAccount = () => {
    navigate("/business-account");
  };

  return (
    <div
      style={{
        backgroundColor: isIncludedBrand ? '#303030' : '#FFF'
      }}

      className={`account-modal-comp ${isOpen ? "account-modal-comp--open" : ""}`}
    >
      <div className="account-modal-comp__header">

        {isIncludedBrand ? (
          <MainLogoDark className="search-modal__logo" />
        ) : (
          <MainLogo className="search-modal__logo" />
        )}
        <button className="account-modal-comp__close-btn" onClick={handleClose}>

          <CloseIcon style={{ color: isIncludedBrand ? "#FFF" : "#151515" }} />
        </button>
      </div>


      <div className="account-modal-comp__profile">
        <div className="account-modal-comp__avatar">{getUserInitials()}</div>
        <div className="account-modal-comp__user-info">
          <div className="account-modal-comp__user-name">{userData?.name}</div>
          <div


            style={{
              color: isIncludedBrand ? '#DFDFDF' : ''
            }}

            className="account-modal-comp__user-email">
            {userData?.email ? userData.email : userData.identifier}
          </div>
        </div>
        <NotificationIcon
          onClick={() => setNotificationModel(!notificationModel)}

          count={1} />
      </div>

      <div className="account-modal-comp__menu">
        {MENU_ITEMS.map((item, index) => (
          <div
            key={index}
            className="account-modal-comp__menu-item"
            onClick={() => handleMenuClick(item.route)}
          >
            <div className="account-modal-comp__menu-content">
              <div className="account-modal-comp__menu-icon">

                {isIncludedBrand ? 
                <img src={item.darkMode} alt={item.title} /> : 
                <img src={item.icon} alt={item.title} />}
              </div>
              <div className="account-modal-comp__menu-text">
                <div

                  style={{
                    color: isIncludedBrand ? '#DFDFDF' : ''
                  }}
                  className="account-modal-comp__menu-title">
                  {item.title}
                </div>
                <div

                  style={{
                    color: isIncludedBrand ? '#DFDFDF' : ''
                  }}
                  className="account-modal-comp__menu-subtitle">
                  {item.subtitle}
                </div>
              </div>
            </div>
            <span className="account-modal-comp__menu-arrow">
              <EastIcon style={ARROW_STYLE} />
            </span>
          </div>
        ))}
      </div>
      {/* 
      {companyStatus && (
        <div className="account-modal-comp__business-title">Business Overview</div>
      )}

      {companyStatus && (
        <div className="account-modal-comp__menu-item">
          <div className="account-modal-comp__menu-content">
            <div className="account-modal-comp__menu-icon">
              <HomeBusiness />
            </div>
            <div onClick={handleToSetting} className="account-modal-comp__menu-text">
              <div className="account-modal-comp__menu-title">
                Business Account{" "}
                <span
                  className={`account-modal-comp__biz-status account-modal-comp__biz-status--${companyStatus?.toLowerCase()}`}
                >
                  {companyStatus
                    ? companyStatus[0].toUpperCase() +
                      companyStatus.slice(1).toLowerCase()
                    : "N/A"}
                  {(companyStatus === "PENDING" ||
                    companyStatus === "SUSPENDED") && (
                    <span className="account-modal-comp__status-info">
                      <InfoOutlinedIcon className="account-modal-comp__status-info-icon" />
                      <div className="account-modal-comp__status-tooltip">
                        {companyStatus === "SUSPENDED" ? (
                          <p>
                            Your business account is under review. Activation
                            typically takes 1–3 business days.
                          </p>
                        ) : (
                          <p>
                            Your account has been suspended. Please contact{" "}
                            <span>Support</span> for further assistance.
                          </p>
                        )}
                      </div>
                    </span>
                  )}
                </span>
              </div>
              <div className="account-modal-comp__menu-subtitle">
                Account Info & permissions
              </div>
            </div>
          </div>
          <span className="account-modal-comp__menu-arrow">
            <EastIcon style={ARROW_STYLE} />
          </span>
        </div>
      )}

      {companyStatus === "ACTIVE" && (
        <>
          <div className="account-modal-comp__menu-item">
            <div className="account-modal-comp__menu-content">
              <div className="account-modal-comp__menu-icon">
                <Orders />
              </div>
              <div className="account-modal-comp__menu-text">
                <div className="account-modal-comp__menu-title">
                  Business Orders
                </div>
                <div className="account-modal-comp__menu-subtitle">
                  Current orders & history
                </div>
              </div>
            </div>
            <span className="account-modal-comp__menu-arrow">
              <EastIcon style={ARROW_STYLE} />
            </span>
          </div>

          <div className="account-modal-comp__menu-item">
            <div className="account-modal-comp__menu-content">
              <div className="account-modal-comp__menu-icon">
                <MailBusiness />
              </div>
              <div className="account-modal-comp__menu-text">
                <div className="account-modal-comp__menu-title">
                  Purchase Offers Requests
                </div>
                <div className="account-modal-comp__menu-subtitle">
                  Current orders & history
                </div>
              </div>
            </div>
            <span className="account-modal-comp__menu-arrow">
              <EastIcon style={ARROW_STYLE} />
            </span>
          </div>
        </>
      )}

      {!companyStatus && (
        <div className="account-modal-comp__business-cta">
          <div className="account-modal-comp__business-title">
            Buying for work?
          </div>
          <div className="account-modal-comp__business-subtitle">
            Get the best wholesale prices for your business.
          </div>
          <div
            onClick={handleCheckBusinessAccount}
            className="account-modal-comp__business-link"
          >
            Create a business account
          </div>
          {messageCompany.length > 0 && (
            <p className="account-modal-comp__message-company">
              {messageCompany}
            </p>
          )}
        </div>
      )} */}

      {/* {notificationModel && (
        <NotificationDrawer
          open={notificationModel}
          onClose={() => setNotificationModel(false)}
        />
      )} */}
      <div className="account-modal-comp__bottom">
        <button
          style={{
            color: isIncludedBrand ? '#FFF' : ''
          }}
          className="account-modal-comp__logout-btn" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </div>
  );
};

export default AccountModal;