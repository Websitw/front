import './PromoCard.css';
import { Timer } from '../../assets/icons';



const PromoCard = ({
  title = 'SAWA',
  subtitle = "Today's Deals",
  tagline = 'Sale on Everything',
  buttonText = 'Shop Now',
  timerText,
  backgroundColor = '',
  backgroundImage,
  onButtonClick,
  onCardClick,
  className = '',
}) => {
  const handleButtonClick = (e) => {
    e.stopPropagation();
    if (onButtonClick) {
      onButtonClick();
    }
  };

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick();
    }
  };

  return (
    <div
      className={`promo-card ${className}`}
      style={{ backgroundColor, backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none' }}
      onClick={handleCardClick}
    >
     

      {timerText && (
        <div className="promo-card__timer">
          <span className="promo-card__timer-text">{timerText}</span>
          <Timer />
        </div>
      )}

      <div className="promo-card__content">
        <div className="promo-card__titles">
          <h2 className="promo-card__title">{title}</h2>
          <h2 className="promo-card__subtitle">{subtitle}</h2>
                  <p className="promo-card__tagline">{tagline}</p>

        </div>


        <button className="promo-card__button" onClick={handleButtonClick}>
          {buttonText}
        </button>
      </div>
    </div>
  );
};



export default PromoCard;