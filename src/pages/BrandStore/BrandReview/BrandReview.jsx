import { useState } from "react";
import StarIcon from "@mui/icons-material/Star";
import { EmptyStart } from "../../../assets/icons";
import "./BrandReview.css";

const BrandReview = ({
  totalStars = 5,
  value = 0,
  onChange,
  starSize = 28,
  showValue = true,
  readOnly = false,
  ratingCount,
}) => {
  const [hoveredRating, setHoveredRating] = useState(null);

  const displayedRating = hoveredRating ?? value;

  const handleClick = (star) => {
    if (readOnly) return;
    onChange?.(value === star ? 0 : star);
  };

  const getFillPercent = (starIndex) => {
    if (displayedRating >= starIndex) return 100;
    if (displayedRating > starIndex - 1) return (displayedRating - (starIndex - 1)) * 100;
    return 0;
  };

  return (
    <div className="brand-review">
      <h4>Rate The Store</h4>
      <div className="brand-review__stars">
        {Array.from({ length: totalStars }, (_, i) => i + 1).map((star) => {
          const fill = getFillPercent(star);

          return (
            <span
              key={star}
              className={`brand-review__star ${readOnly ? "brand-review__star--readonly" : ""}`}
              onClick={() => handleClick(star)}
              onMouseEnter={() => !readOnly && setHoveredRating(star)}
              onMouseLeave={() => !readOnly && setHoveredRating(null)}
            >
              {fill === 100 ? (
                <StarIcon className="brand-review__star-filled" />
              ) : fill === 0 ? (
                <EmptyStart className="brand-review__star-empty" />
              ) : (
                <span className="brand-review__star-partial">
                  <span
                    className="brand-review__star-partial-filled"
                    style={{ width: `${fill}%` }}
                  >
                    <StarIcon className="brand-review__star-filled" />
                  </span>
                  <EmptyStart className="brand-review__star-empty" />
                </span>
              )}
            </span>
          );
        })}
        {showValue && (
          <div>
            <span className="brand-review__value">{value.toFixed(1)}</span>
            <span className="brand-review__value">({ratingCount})</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandReview;