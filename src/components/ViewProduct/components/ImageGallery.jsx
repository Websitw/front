import { useCallback, useMemo, useRef, useState } from "react";
import { ZoomIn, Play } from "lucide-react";
import ImageGalleryModal from "./ImageVideosModal/ImageGalleryModal";

const ImageGallery = ({ images, videoThumbnail, handleOpenModal, handleCloseModal }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const mainImageRef = useRef(null);

  const handleMouseMove = useCallback(
    (e) => {
      if (!isZoomed || !mainImageRef.current) return;
      const rect = mainImageRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setZoomPosition({
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      });
    },
    [isZoomed]
  );

  const thumbnails = useMemo(() => {
    const items = images.map((img, i) => ({
      type: "image",
      src: img,
      index: i,
    }));
    if (videoThumbnail) {
      items.push({ type: "video", src: videoThumbnail, index: images.length });
    }
    return items;
  }, [images, videoThumbnail]);

  const extraCount = thumbnails.length > 4 ? thumbnails.length - 3 : 0;


  return (
    <>
      <div className="image-gallery">
        <div
          className={`main-image-container ${isZoomed ? "zoomed" : ""}`}
          ref={mainImageRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setIsZoomed(false)}
          style={
            isZoomed
              ? {
                  "--zoom-x": `${zoomPosition.x}%`,
                  "--zoom-y": `${zoomPosition.y}%`,
                }
              : {}
          }
        >
          <img
            src={images[activeIndex] || images[0]}
            alt={`Product view ${activeIndex + 1}`}
            className="main-image"
            style={{
              // backgroundColor:'red',
              // padding:'20px'
            }}
            draggable={false}
          />
          <button
            type="button"
            className="zoom-btn"
            onClick={() => setIsZoomed(!isZoomed)}
            aria-label="Toggle zoom"
          >
            <ZoomIn size={18} />
          </button>
        </div>
        <div className="thumbnail-strip">
          {thumbnails.slice(0, 3).map((thumb, i) => (
            <button
              key={i}
              type="button"
              className={`thumbnail ${activeIndex === thumb.index ? "active" : ""}`}
              onClick={() =>
                thumb.type === "image" && setActiveIndex(thumb.index)
              }
            >
              <img
                src={thumb.src}
                alt={`Thumbnail ${i + 1}`}
                draggable={false}
              />
            </button>
          ))}
          {extraCount > 0 && (
            <button
              type="button"
              className="thumbnail extra-count"
              onClick={handleOpenModal}
            >
              <img
                src={thumbnails[3].src}
                alt="More"
                draggable={false}
              />
              <span className="count-overlay">+{extraCount}</span>
            </button>
          )}
          {videoThumbnail && (
            <button type="button" className="thumbnail video-thumb">
              <img
                src={videoThumbnail}
                alt="Video thumbnail"
                draggable={false}
              />
              <span className="video-overlay">
                <Play size={16} fill="white" />
              </span>
              <span className="video-label">Video</span>
            </button>
          )}
        </div>
      </div>

   
    </>
  );
};

export default ImageGallery;