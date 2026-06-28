import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
const Navbar = () => {

  
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const token = localStorage.getItem('token');
  const { t, i18n } = useTranslation();
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.body.dir = lng === "ar" ? "rtl" : "ltr";
  };



  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      navigate("/shop", { state: { search: searchTerm } });
      setSearchTerm('');
    }
  };



  useEffect(() => {
    document.documentElement.dir = i18n.dir();
  }, [i18n.language]);

  const [time, setTime] = useState({
    days: 47,
    hours: 6,
    minutes: 55,
    seconds: 51
  });


  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prevTime => {
        let { days, hours, minutes, seconds } = prevTime;

        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else if (days > 0) {
          days--;
          hours = 23;
          minutes = 59;
          seconds = 59;
        }

        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <div className="promo-container">
        <div className="top-banner">
      <div className="top-content">
    
        <p className="promo-text">{t("freeDelivery")}</p>

        <div className="countdown">
          <span className="countdown-label">{t("untilEndOfSale")}</span>
          <div className="time-units">
            <div className="time-unit">
              <span className="time-value">{time.days}</span>
              <span className="time-label">{t("days")}</span>
            </div>
            <div className="time-unit">
              <span className="time-value">{String(time.hours).padStart(2, "0")}</span>
              <span className="time-label">{t("hours")}</span>
            </div>
            <div className="time-unit">
              <span className="time-value">{String(time.minutes).padStart(2, "0")}</span>
              <span className="time-label">{t("minutes")}</span>
            </div>
            <div className="time-unit">
              <span className="time-value">{String(time.seconds).padStart(2, "0")}</span>
              <span className="time-label">{t("seconds")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>


        <div className="bottom-nav">
          <div className="nav-content">
        
<div className="left-nav">
      <p
        style={{ cursor: 'pointer' }}
        onClick={() => navigate('/aboutUs')}
        className="nav-link"
      >
        {t("about_us")}
      </p>

      <a href="#" className="nav-link">{t("my_account")}</a>

      {/* <p
        style={{ cursor: 'pointer' }}
        onClick={() => navigate('/WishList')}
        className="nav-link"
      >
        {t("wishlist")}
      </p> */}

      <span className="delivery-text">
        {t("delivery_message")}{" "}
        <span className="time-highlight">{t("delivery_time")}</span>
      </span>
    </div>



  
            <div className="right-nav">
      
      <select
        className="nav-select"
        onChange={(e) => changeLanguage(e.target.value)} 
        value={i18n.language} 
      >
        <option value="en">English</option>
        <option value="ar">العربية</option>
      </select>



      {/* <a href="#" className="nav-link">{t("order_tracking")}</a> */}
    </div>

          </div>
        </div>


        <div className="main-header">
          <div className="header-content">

           
          <div className="logo-section">
        <div className="logo">
          <div className="logo-icon">
            <span className="cart-emoji">🛒</span>
          </div>
          <span className="logo-text">ShopStore</span>
        </div>

        <button
                    onClick={() => navigate("/myorders")}

        
        className="location-btn">
          <BookmarkBorderIcon/>
          <div className="location-text">
            {/* deliver_to */}
            <span className="deliver-to">{t("myOrders")}</span>
            <span className="location-name">{t("location_all")}</span>
          </div>
        </button>
      </div>

      <div className="search-container">
        <input
          type="text"
          value={searchTerm}
          onKeyDown={handleKeyPress}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          placeholder={t("search_placeholder")}
        />
        <button className="search-btn">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </button>
      </div>

      <div className="header-actions">
        {!token ? (
          <button
            onClick={() => navigate("/Signin")}
            className="icon-btn account-btn"
          >
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <div className="btn-text">
              <span className="btn-label">{t("sign_in")}</span>
              <span className="btn-main">{t("account")}</span>
            </div>
          </button>
        ) : (
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("userData");
              localStorage.removeItem("userId");
              localStorage.removeItem("xPayId");
              localStorage.removeItem("cartID");
              window.dispatchEvent(new Event('authStateChanged'));
              navigate("/");
            }}
            className="icon-btn account-btn"
          >
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <div className="btn-text">
              <span className="btn-label">{t("sign_out")}</span>
              <span className="btn-main">{t("logout")}</span>
            </div>
          </button>
        )}
              <button
                onClick={() => {
                  navigate('/WishList')
                }}
                className="icon-btn wishlist-btn">
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span className="badge">1</span>
              </button>

              <button
                onClick={() => {
                  navigate("/Cart");
                }}
                className="icon-btn cart-btn">
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                <span className="badge">5</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>



  );
};

export default Navbar;