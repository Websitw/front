import React, { useState, useEffect } from "react";
import "./HeroGuideOverlay.css";

import HandImg from "../../../assets/image/Click.png";
import GuideVideo from "../../../assets/videos/indicatorVideo.mp4"; 

const HeroGuideOverlay = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isVisit = localStorage.getItem("isVisit");
    if (isVisit === "false" || isVisit === null) {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!visible) {
      document.body.style.overflow = "";
      return undefined;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [visible]);

  const handleDismiss = () => {
    localStorage.setItem("isVisit", "true");
    setVisible(false);
  };


  if (!visible) return null;

  return (
    <div className="hero-guide-overlay" onClick={handleDismiss}>
      <div className="overlay-bg" />
      <div className="guide-card" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          className="close-btn"
          aria-label="Close guide"
          onClick={handleDismiss}
        >
          ×
        </button>
        <p className="guide-text">
          Switch between regular and brand-name shopping for a curated
          experience that matches your style.
        </p>

        <div className="guide-video-wrapper">
          <video
            src={GuideVideo}
            autoPlay
            muted
            loop
            playsInline
          />
        </div>
      </div>

      <img src={HandImg} alt="hand" className="guide-hand" />
    </div>
  );
};

export default HeroGuideOverlay;
