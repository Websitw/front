import React, { useRef, useState, useEffect } from "react";
import { Heart, Star, Volume2, VolumeX } from "lucide-react";

import { environment } from "../../../environments/environment";
import StarRating from "../../../components/ViewProduct/components/StarRating";
import { addFavoriteBrand, removeFavoriteBrand } from "../../../store/slices/favoriteBrandSlice";
import { useDispatch } from "react-redux";
import { MostLoved } from "../../../assets/icons";
import BrandReview from "../BrandReview/BrandReview";
import { useNavigate } from "react-router-dom";
import useLocalStorage from "../../../hooks/useLocalStorage";
import { showToast } from "../../../components/CustomToast/CustomToast";
import { buildBrandMarketPath } from "../../../helper/brandRoutes";

const BrandHeroVideo = ({
  videoSrc,
  onVideoEnd,
  brandDescription,
  brandName,
  brandVideoId,
  rating,
  ratingCount,
  currentBrand,
  getBrands,
  brandId
}) => {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const dispatch = useDispatch();
  const [userData] = useLocalStorage("userData", null);
  const navigate = useNavigate();


  const activeSrc = brandVideoId
    ? `${environment.fileUrl}${brandVideoId}`
    : videoSrc;

  const toggleVolume = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play()?.catch(() => {});
    }
  }, [activeSrc]);


  const addtoFavoriteBrand = (isFavorite) => {
    if (!currentBrand?.id) {
      return;
    }

    if (!userData) {
      showToast.error("You need to be logged in to manage favorite brands");
      return;
    }
    if (!isFavorite) {
      dispatch(
        addFavoriteBrand({
          brandId: currentBrand.id,
          userId: userData?.id,
        }),
      ).then(() => {
        getBrands();
      })
        .catch((error) => {
          showToast.error(error?.message || "Failed to add to favorite brand");
          console.error("Error adding to favorite brand:", error);
        });
    }
    else {
      dispatch(
        removeFavoriteBrand(currentBrand.id),
      ).then(() => {
        getBrands();
      })
        .catch((error) => {
          showToast.error(error?.message || "Failed to remove from favorite brand");
          console.error("Error removing from favorite brand:", error);
        });
    }
  }

  const handleRatingChange = (newRating) => {
    setUserRating(newRating);
    setShowReview(false);
  };

  
  return (
    <section className="hero">
      <video
        ref={videoRef}
        className="hero-video"
        src={activeSrc}
        autoPlay
        muted={isMuted}
        loop={false}
        playsInline
        onEnded={onVideoEnd}
      />

      <div className="hero-overlay" />
      <div className="hero-content">
        <h1 className="hero-title">{brandName}</h1>
        <div className="hero-text">
          <div
            style={{
              display: "flex",
            }}
          >
            <span className="most-loved">
              <MostLoved />
            </span>
            <span className="hero-label">Most Loved Brand</span>
          </div>
          {brandDescription && (
            <p className="brand-hero-video__description">{brandDescription}</p>
          )}
        </div>

        <div className="hero-rating">
          <div className="stars">
            <StarRating rating={rating} />
          </div>
          <span className="rating-text">
            {rating} ({ratingCount})
          </span>
        </div>

        <div className="hero-actions">
          <button
          style={{
            cursor:'pointer'
          }}
            onClick={() => navigate(buildBrandMarketPath(currentBrand || brandId))}
          className="shop-btn">Shop Now</button>
          <button className={`icon-btn ${currentBrand?.isFavorite ? "heart-active" : ""}`} onClick={() => addtoFavoriteBrand(currentBrand?.isFavorite)}>
            <Heart size={20} fill={currentBrand?.isFavorite ? "#F26D6E" : "none"} />
          </button>
          <div className="flex-center-row">
            <button
              className={`icon-btn ${userRating > 0 ? "rated" : ""}`}
              onClick={() => setShowReview((prev) => !prev)}
            >
              {userRating > 0 ? (
                <Star size={20} fill="#E6D03B" stroke="#E6D03B" />
              ) : (
                <Star size={20} />
              )}
            </button>

            {userRating > 0 && (
              <span className="user-rating-display">
                {userRating.toFixed(1)} <span>Rate</span>
              </span>
            )}

            {showReview && (
              <BrandReview
                value={userRating}
                onChange={handleRatingChange}
                ratingCount={ratingCount}
              />
            )}
          </div>

          <button
            className="volume-btn volume-btn--inline"
            aria-label={isMuted ? "Unmute brand video" : "Mute brand video"}
            onClick={toggleVolume}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </div>

      <button
        className="volume-btn volume-btn--floating"
        aria-label={isMuted ? "Unmute brand video" : "Mute brand video"}
        onClick={toggleVolume}
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
    </section>
  );
};

export default BrandHeroVideo;
