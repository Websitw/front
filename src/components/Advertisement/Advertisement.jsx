import React, { useEffect, useState } from "react";
import axios from "axios";
import {environment} from '../../environments/environment'
import "./Advertisement.css";
import { useNavigate } from "react-router-dom";


const AdvertisementBanner = () => {
  const [banner, setBanner] = useState(null);
  const navigate = useNavigate();


  const getLandingPage = async () => {
    try {
      const response = await axios.get(
        `${environment.serverOrigin}landing-page`,
        {
          headers: {
            Authorization: `Anonymous=${environment.appid}`,
          },
        }
      );

      const promoBanner =
        response?.data?.items?.[0]?.promoBanner;

      setBanner(promoBanner);
    } catch (error) {
      console.error("Error fetching banner:", error);
    }
  };

  useEffect(() => {
    getLandingPage();
  }, []);

  if (!banner) return null;

  const imageUrl = `${environment.serverOrigin}_xfilestore/mada/${banner.mediaId}`;


  const handleViewAll = () => {
    navigate("/search");
  };


  return (
    <div
    onClick={handleViewAll}
      className="ad-banner"
      style={{ background: banner.backgroundColor }}
    >
      <div className="ad-banner__image-container">
        <img
          src={imageUrl}
          alt="banner"
          className="ad-banner__image"
        />
      </div>

      <div className="ad-banner__content">
        <div className="ad-banner__text-wrapper">
          <span className="ad-banner__discount-value">
            {banner.title?.en.match(/\d+/)?.[0]}%
          </span>

          <div>
            <h3 className="ad-banner__discount-label">
              {banner.title?.en.replace(/\d+%?/, "").trim()}
            </h3>
            <p className="ad-banner__subtitle">
              {banner.subTitle?.en}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdvertisementBanner;
