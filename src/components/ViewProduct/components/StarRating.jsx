import { EmptyStart } from "../../../assets/icons/";

const StarRating = ({ rating, maxStars = 5 }) => {
  return (
    <div className="star-rating">
      {Array.from({ length: maxStars }, (_, i) => {
        const filled = i < Math.floor(rating);
        const partial = !filled && i < rating;
        const isFilled = filled || partial;

        return (
          <span key={i} className={`star ${filled ? "filled" : ""} ${partial ? "partial" : ""}`}>
            <EmptyStart
              style={{
                width: 15,
                height: 15,
                color: isFilled ? "#E6D03B" : "none",
              }}
              size={15}
              fill={isFilled ? "#E6D03B" : "none"}
              stroke="#E6D03B"
            />
          </span>
        );
      })}
    </div>
  );
};

export default StarRating;