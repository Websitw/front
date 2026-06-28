

import './BrandAdvertisementBanner.css';
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { environment } from '../../../environments/environment';

export const imageUrl = `${environment.serverOrigin}_xfilestore/mada/`;



const BrandAdvertisementBanner = ({
  imageAlt = 'Product',
  discountValue = '30',
  discountLabel = 'Off On Computers',
  subtitle = 'Upgrade your tech, conquer your goals!',
  buttonText = 'Shop Now',
  backgroundColor = 'linear-gradient(90deg, #000 0%, #000 100%)',
  onButtonClick,
  onBannerClick,
  className = '',
}) => {

  const [searchParams] = useSearchParams();
  const brandId = searchParams.get("brandId");

  const [promoBanner, setPromoBanner] = useState(null);

  const fetchBrandBanner = async () => {
    try {
      const res = await axios.get(
        `${environment.serverOrigin}brand-landing?q=properties.brandId:${brandId}`,
        {
          headers: {
            Authorization: `Anonymous=${environment.appid}`, 
          },
        }
      );

      const items = res?.data?.items || [];

      if (items.length > 0) {
        const data = items[0];

        setPromoBanner(data?.promoBanner || null);
      }

    } catch (error) {
      console.error("Error fetching brand banner:", error);
    }
  };

  useEffect(() => {
    if (brandId) {
      fetchBrandBanner();
    }
  }, [brandId]);

  const handleButtonClick = (e) => {
    e.stopPropagation();
    onButtonClick && onButtonClick();
  };

  const handleBannerClick = () => {
    onBannerClick && onBannerClick();
  };

  return (
    <div className="barnd-template-ads">

      <div
        className={`ad-banner-brand ${className}`}
        style={{
          background: promoBanner?.backgroundColor || backgroundColor,
        }}
        onClick={handleBannerClick}
        role="banner"
      >

        <div className="ad-banner__image-container">
          <img
            src={
              promoBanner?.mediaId
                ? `${imageUrl}${promoBanner.mediaId}`
                : ''
            }
            alt={imageAlt}
            className="ad-banner__image"
            loading="lazy"
          />
        </div>

        <div className="ad-banner__content">

          <div className="ad-banner__text-wrapper">

            <span className="ad-banner__discount-value">
              {promoBanner?.title?.en?.match(/\d+/)?.[0] || discountValue}%
            </span>

            <div className="ad-banner__text-content">
              <h3 className="ad-banner__discount-label">
                {promoBanner?.title?.en || discountLabel}
              </h3>

              <p className="ad-banner__subtitle">
                {promoBanner?.subTitle?.en || subtitle}
              </p>
            </div>

          </div>

          <div className="ad-banner__cta-wrapper">
            {/* <button
              className="ad-banner__cta-button"
              onClick={handleButtonClick}
            >
              {buttonText}
            </button> */}
          </div>

        </div>
      </div>
    </div>
  );
};

export default BrandAdvertisementBanner;
