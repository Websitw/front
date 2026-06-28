import React, { useEffect, useMemo, useRef, useState } from "react";
import { Star } from "lucide-react";
import { imageUrl } from "../../../helper/helper";
import "./BrandTape.css";

const FALLBACK_BRAND_COPY = "Shop the latest collections.";

const getBrandCopy = (brand, maxLength = 88) => {
  const rawCopy =
    brand?.brandDescription_i18n?.en ||
    brand?.brandDescription ||
    FALLBACK_BRAND_COPY;

  if (rawCopy.length <= maxLength) {
    return rawCopy;
  }

  return `${rawCopy.slice(0, maxLength).trim()}...`;
};

const BrandTape = ({ brands = [], activeIndex = 0, setActiveIndex }) => {
  const sectionRef = useRef(null);
  const railRef = useRef(null);
  const itemRefs = useRef([]);
  const [supportsHover, setSupportsHover] = useState(false);
  const [hoverIndex, setHoverIndex] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);
  const [panelStyle, setPanelStyle] = useState({});

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

    const updateHoverMode = () => {
      const canHover = mediaQuery.matches;
      setSupportsHover(canHover);

      if (canHover) {
        setOpenIndex(null);
      }
    };

    updateHoverMode();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", updateHoverMode);
      return () => mediaQuery.removeEventListener("change", updateHoverMode);
    }

    mediaQuery.addListener(updateHoverMode);
    return () => mediaQuery.removeListener(updateHoverMode);
  }, []);

  useEffect(() => {
    if (!brands.length) {
      setHoverIndex(null);
      setOpenIndex(null);
      return;
    }

    if (activeIndex >= brands.length) {
      setActiveIndex(0);
    }

    if (hoverIndex !== null && hoverIndex >= brands.length) {
      setHoverIndex(null);
    }

    if (openIndex !== null && openIndex >= brands.length) {
      setOpenIndex(null);
    }
  }, [activeIndex, brands.length, hoverIndex, openIndex, setActiveIndex]);

  useEffect(() => {
    if (supportsHover || openIndex === null) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (sectionRef.current?.contains(event.target)) {
        return;
      }

      setOpenIndex(null);
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpenIndex(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openIndex, supportsHover]);

  const previewIndex = supportsHover ? hoverIndex : openIndex;

  const previewBrand = useMemo(
    () => (previewIndex === null ? null : brands[previewIndex] ?? null),
    [brands, previewIndex],
  );

  useEffect(() => {
    if (previewIndex === null) {
      setPanelStyle({});
      return undefined;
    }

    const updatePanelPosition = () => {
      const sectionNode = sectionRef.current;
      const railNode = railRef.current;
      const itemNode = itemRefs.current[previewIndex];

      if (!sectionNode || !itemNode || !railNode) {
        return;
      }

      const sectionRect = sectionNode.getBoundingClientRect();
      const itemRect = itemNode.getBoundingClientRect();
      const isMobile = window.innerWidth <= 768;
      const preferredWidth = isMobile ? 320 : 420;
      const horizontalPadding = isMobile ? 24 : 40;
      const panelWidth = Math.min(preferredWidth, Math.max(sectionRect.width - horizontalPadding, 240));
      const maxLeft = Math.max(sectionRect.width - panelWidth, 0);
      const left = Math.min(
        Math.max(itemRect.left - sectionRect.left, 0),
        maxLeft,
      );
      const top = itemRect.bottom - sectionRect.top + 12;

      setPanelStyle({
        left: `${left}px`,
        top: `${top}px`,
        width: `${panelWidth}px`,
      });
    };

    updatePanelPosition();

    const railNode = railRef.current;
    window.addEventListener("resize", updatePanelPosition);
    railNode?.addEventListener("scroll", updatePanelPosition, { passive: true });

    return () => {
      window.removeEventListener("resize", updatePanelPosition);
      railNode?.removeEventListener("scroll", updatePanelPosition);
    };
  }, [previewIndex]);

  const handleItemMouseEnter = (index) => {
    if (!supportsHover) {
      return;
    }

    setHoverIndex(index);
  };

  const handleItemClick = (index) => {
    setActiveIndex(index);

    if (supportsHover) {
      return;
    }

    setOpenIndex((currentOpenIndex) => (
      currentOpenIndex === index ? null : index
    ));
  };

  const handleItemFocus = (index) => {
    if (supportsHover) {
      setHoverIndex(index);
    }
  };

  if (!brands.length) {
    return null;
  }

  const activeRating = Number(previewBrand?.rating || 0);
  const activeRatingCount = Number(previewBrand?.ratingCount || 0);

  return (
    <section
      className="brand-tape"
      aria-label="Brands"
      ref={sectionRef}
      onMouseLeave={() => {
        if (supportsHover) {
          setHoverIndex(null);
        }
      }}
    >
      <div className="brand-tape__rail" ref={railRef}>
        {brands.map((brand, index) => {
          const isActive = index === activeIndex;
          const isPreviewing = index === previewIndex;

          return (
            <button
              key={brand.id}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              type="button"
              className={`brand-tape__item ${isActive ? "brand-tape__item--active" : ""} ${isPreviewing ? "brand-tape__item--open" : ""}`}
              aria-expanded={isPreviewing}
              onMouseEnter={() => handleItemMouseEnter(index)}
              onFocus={() => handleItemFocus(index)}
              onClick={() => handleItemClick(index)}
            >
              <span className="brand-tape__item-logo">
                {brand?.logoId ? (
                  <img
                    src={`${imageUrl}${brand.logoId}`}
                    alt={brand.brandName}
                    loading="lazy"
                  />
                ) : (
                  <span className="brand-tape__item-logo-fallback">
                    {(brand?.brandName || "B").charAt(0)}
                  </span>
                )}
              </span>

              <span className="brand-tape__item-copy">
                <span className="brand-tape__item-name">{brand.brandName}</span>
                <span className="brand-tape__item-slogan">
                  {getBrandCopy(brand, 58)}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {previewBrand && (
        <div
          className="brand-tape__preview"
          role="region"
          aria-label={`${previewBrand.brandName} details`}
          style={panelStyle}
        >
          <div className="brand-tape__preview-copy">
            <p className="brand-tape__preview-kicker">Brand Spotlight</p>
            <h3 className="brand-tape__preview-title">{previewBrand.brandName}</h3>
            <p className="brand-tape__preview-description">
              {getBrandCopy(previewBrand, 220)}
            </p>

            {(activeRating > 0 || activeRatingCount > 0) && (
              <div className="brand-tape__preview-metrics">
                <span className="brand-tape__metric">
                  <Star size={14} />
                  {activeRating.toFixed(1)}
                </span>
                <span className="brand-tape__metric">
                  {activeRatingCount} {activeRatingCount === 1 ? "review" : "reviews"}
                </span>
              </div>
            )}
          </div>

          <div className="brand-tape__preview-mark" aria-hidden="true">
            <div className="brand-tape__preview-mark-shell">
              {previewBrand?.logoId ? (
                <img
                  src={`${imageUrl}${previewBrand.logoId}`}
                  alt=""
                  loading="lazy"
                />
              ) : (
                <span className="brand-tape__preview-mark-fallback">
                  {(previewBrand?.brandName || "B").charAt(0)}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default BrandTape;
