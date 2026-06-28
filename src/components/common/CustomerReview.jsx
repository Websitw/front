import { useState } from "react";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { EmptyStart } from "../../assets/icons";
import "./CustomerReview.css";

const CustomerReview = ({
  totalStars = 5,
  value = 0,
  onChange,
  starSize = 28,
  showValue = true,
  readOnly = false,
}) => {
  const [hoveredRating, setHoveredRating] = useState(null);

  const displayedRating = hoveredRating ?? value;

  const handleClick = (star) => {
    if (readOnly) return;
    onChange?.(value === star ? 0 : star);
  };
  

  return (
    <div className="customer-review">
      <div className="customer-review__stars">
        {Array.from({ length: totalStars }, (_, i) => i + 1).map((star) => (
          <span
            key={star}
            className={`customer-review__star ${readOnly ? "customer-review__star--readonly" : ""}`}
            onClick={() => handleClick(star)}
            onMouseEnter={() => !readOnly && setHoveredRating(star)}
            onMouseLeave={() => !readOnly && setHoveredRating(null)}
          >
            {star <= displayedRating ? (
              <StarIcon
                className="customer-review__star-filled"
                
                // style={{ fontSize: starSize }}
              />
            ) : (
              <EmptyStart
                className="customer-review__star-empty"
                // style={{ fontSize: starSize }}
              />
            )}
          </span>
        ))}
        {showValue && (
          <span className="customer-review__value">
            {value.toFixed(1)}
          </span>
        )}
      </div>
    </div>
  );
};

export default CustomerReview;