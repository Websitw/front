import "./StarRating.css";

const StarGlyph = ({ className, fill = "empty" }) => (
  <span className={`star-rating__star ${className}`.trim()} aria-hidden="true">
    <span className="star-rating__star-base">★</span>
    {fill !== "empty" ? (
      <span
        className={`star-rating__star-fill ${fill === "half" ? "star-rating__star-fill--half" : ""}`.trim()}
      >
        ★
      </span>
    ) : null}
  </span>
);

const StarRating = ({ rating = 0, ratingCount = 0, emptyLabel = "No reviews" }) => {
  const renderStars = () =>
    [...Array(5)].map((_, i) => {
      const filled = i < Math.floor(rating);
      const half = !filled && i < Math.ceil(rating) && rating % 1 >= 0.5;

      if (filled)
        return <StarGlyph key={i} className="star-rating__star--filled" fill="full" />;
      if (half)
        return <StarGlyph key={i} className="star-rating__star--half" fill="half" />;
      return <StarGlyph key={i} className="star-rating__star--empty" fill="empty" />;
    });

  return (
    <div className="star-rating-con">
      <div className="star-rating__stars">{renderStars()}</div>
      <span className="star-rating__label">
        {rating > 0 ? rating.toFixed(1) : emptyLabel}
        {ratingCount > 0 && ` (${ratingCount})`}
      </span>
    </div>
  );
};

export default StarRating;
