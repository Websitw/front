import { useState } from "react";
import StarIcon from "@mui/icons-material/Star";
import { EmptyStart } from "../../../assets/icons";
import "./RatingFilter.css";


const RatingFilter = ({ selectedRating, onRatingChange }) => {
  const [hoveredRating, setHoveredRating] = useState(null);

  const displayedRating = hoveredRating ?? selectedRating ?? 0;

  const handleRatingClick = (rating) => {
    onRatingChange(selectedRating === rating ? null : rating);
  };

  return (
    <div className="rating-filter">
      <div className="rating-filter__stars-row">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className="rating-filter__star-icon"
            onClick={() => handleRatingClick(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(null)}
          >
            {star <= displayedRating ? (
              <StarIcon className="rating-filter__star-filled" />
            ) : (
              <EmptyStart className="rating-filter__star-empty" />
            )}
          </span>
        ))}
        <span className="rating-filter__value">
          {selectedRating ? selectedRating.toFixed(1) : "0.0"}
        </span>
      </div>
    </div>
  );
};

export default RatingFilter;