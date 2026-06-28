import { useState, useEffect, useRef, useMemo } from "react";
import { X, Play } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./ImageGalleryModal.css";

function ImageGalleryModal({ isOpen, onClose, images = [], videoThumbnail }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const overlayRef = useRef(null);
  const swiperRef = useRef(null);

  const mediaItems = useMemo(() => {
    const items = images.map((img, i) => ({
      type: "image",
      src: img,
      index: i,
    }));
    if (videoThumbnail) {
      items.push({
        type: "video",
        src: videoThumbnail,
        index: images.length,
      });
    }
    return items;
  }, [images, videoThumbnail]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setActiveIndex(0);
      setIsVideoPlaying(false);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleSlideChange = (swiper) => {
    setActiveIndex(swiper.activeIndex);
    setIsVideoPlaying(false);
  };

  const handleThumbClick = (index) => {
    setActiveIndex(index);
    if (swiperRef.current) {
      swiperRef.current.slideTo(index);
    }
  };

  const handleVideoClick = () => {
    setIsVideoPlaying(true);
  };

  if (!isOpen) return null;

  return (
    <div
      className="gallery-modal-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
    >
      <div className="gallery-modal-container">
        <div className="gallery-modal-header">
          <h2 className="gallery-modal-title">Product Images & Videos</h2>
          <button
            type="button"
            className="gallery-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={22} />
          </button>
        </div>

        <div className="gallery-modal-divider" />

        <div className="gallery-modal-content">
          <div className="gallery-modal-main">
            <Swiper
              modules={[Navigation, Pagination]}
              onSlideChange={handleSlideChange}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
              spaceBetween={0}
              slidesPerView={1}
              pagination={{ clickable: true }}
              className="gallery-main-swiper"
            >
              {mediaItems.map((item, i) => (
                <SwiperSlide key={i}>
                  {item.type === "image" ? (
                    <div className="gallery-slide-image-wrapper">
                      <img
                        src={item.src}
                        alt={`Product view ${i + 1}`}
                        className="gallery-slide-image"
                        draggable={false}
                      />
                    </div>
                  ) : (
                    <div className="gallery-slide-video-wrapper">
                      {isVideoPlaying && activeIndex === item.index ? (
                        <video
                          className="gallery-slide-video"
                          controls
                          autoPlay
                        >
                          <source src="" type="video/mp4" />
                        </video>
                      ) : (
                        <div
                          className="gallery-video-placeholder"
                          onClick={handleVideoClick}
                        >
                          <img
                            src={item.src}
                            alt="Video thumbnail"
                            className="gallery-slide-image"
                            draggable={false}
                          />
                          <div className="gallery-video-play-main">
                            <Play size={48} fill="white" stroke="white" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <div className="gallery-modal-thumbs">
            <div className="gallery-thumbs-grid">
              {mediaItems.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  className={`gallery-thumb-item ${activeIndex === i ? "active" : ""}`}
                  onClick={() => handleThumbClick(i)}
                >
                  <img
                    src={item.src}
                    alt={`Thumbnail ${i + 1}`}
                    className="gallery-thumb-image"
                    draggable={false}
                  />
                  {item.type === "video" && (
                    <div className="gallery-thumb-video-overlay">
                      <Play size={20} fill="white" stroke="white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageGalleryModal;