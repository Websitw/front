import './DealCard.css';

const ArrowIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 10H16M16 10L10 4M16 10L10 16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DealCard = ({
  id,
  image,
  imageAlt = 'Deal',
  title,
  description,
  onClick,
  className = '',
  footerColor = '#EC7677',
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

  const handleArrowClick = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick(id);
    }
  };

  return (
    <div className={`deal-card ${className}`} onClick={handleClick}>
      {/* Image Section */}
      <div className="deal-card__image-wrapper">
        <img
          src={image}
          alt={imageAlt}
          className="deal-card__image"
          loading="lazy"
        />
      </div>

      {/* Footer Section */}
      <div
        className="deal-card__footer"
        style={{ backgroundColor: footerColor }}
      >
        <div className="deal-card__content">
          <h3 className="deal-card__title">{title}</h3>
          <p className="deal-card__description">{description}</p>
        </div>

        <button
          className="deal-card__arrow-btn"
          onClick={handleArrowClick}
          aria-label={`View ${title}`}
        >
          <ArrowIcon />
        </button>
      </div>
    </div>
  );
};


export default DealCard;