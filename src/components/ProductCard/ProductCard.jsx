import './ProductCard.css';
import { Timer, LocationB } from '../../assets/icons';
import IMAGENOTFOUND from '../../assets/icons/imageNotFound.png';
import StarRating from '../common/StarRating/StarRating';
// const StarRating = ({ rating, maxStars = 5 }) => {
//   const stars = [];
//   const fullStars = Math.floor(rating);
//   const hasHalfStar = rating % 1 !== 0;

//   for (let i = 0; i < maxStars; i++) {
//     if (i < fullStars) {
//       stars.push(
//         <span key={i} className="star star-filled">
//           ★
//         </span>
//       );
//     } else if (i === fullStars && hasHalfStar) {
//       stars.push(
//         <span key={i} className="star star-half">
//           ★
//         </span>
//       );
//     } else {
//       stars.push(
//         <span key={i} className="star star-empty">
//           ☆
//         </span>
//       );
//     }
//   }

//   return <div className="star-rating">{stars}</div>;
// };





const ProductCard = ({
  id,
  product,
  image,
  title,
  rating = 0,
  reviewCount = 0,
  currentPrice,
  originalPrice,
  currency = 'JOD',
  discountPercentage,
  stockLeft,
  deliveryText = 'Deliver To Your Location',
  timerText,
  noReviewsLabel = 'No reviews',
  addToCartLabel = 'Add to Cart',
  stockLeftText = '',
  onAddToCart,
  onCardClick,
  handleOpenViewProduct,
}) => {
  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(id);
    }
  };

  return (
    <div className="product-card" onClick={handleCardClick}>
      <div onClick={handleOpenViewProduct} className="product-card__image-wrapper">
        {/* {discountPercentage && (
          <div className="product-card__discount-badge">
            {discountPercentage}% OFF
          </div>
        )} */}

        {/* {!image ? <img 
        src={IMAGENOTFOUND}
      
        /> : 
        <img
          src={image}
          // alt={title}
          className="product-card__image"
          loading="lazy"
        />} */}

        <img
  src={image || IMAGENOTFOUND}
  alt={title || product?.productTitle || product?.name || 'Product image'}
  className="product-card__image"
  loading="lazy"
  decoding="async"
  fetchPriority="low"
  onError={(e) => {
    e.target.src = IMAGENOTFOUND;
  }}
/>


        {timerText && (
          <div className="product-card__timer">
            <span className="product-card__timer-text">{timerText}</span>
            <Timer />
          </div>
        )}
      </div>

      <div className="product-card__info">
        <h3 className="product-card__title">{title}</h3>

        <div className="product-card__rating">
          <StarRating rating={rating} ratingCount={reviewCount} emptyLabel={noReviewsLabel} />
          {/* <StarRating rating={rating} />
          <span className="product-card__rating-value">{rating}</span>
          <span className="product-card__review-count">({reviewCount})</span> */}
        </div>

        <div className="product-card__delivery">
          <LocationB />
          <span className="product-card__delivery-text">{deliveryText}</span>
        </div>

        <div className="product-card__price-wrapper">
          <span className="product-card__current-price">
            {currency}
            <span className="product-card__price-value">
              {currentPrice}
            </span>
            <span className="product-card__price-decimal">
            </span>
          </span>

         
          {originalPrice && (
            <span className="product-card__original-price">
              {currency} {originalPrice.toFixed(2)}
            </span>
          )}

          {(stockLeftText || stockLeft) && (
            <span className="product-card__stock-left">
              {stockLeftText || `Only ${stockLeft} Left`}
            </span>
          )}
        </div>

      
      <div className='main-product-btn'>

      <button
          className="product-card__add-to-cart"
          onClick={handleAddToCart}
          type='button'
        >
          {addToCartLabel}
        </button>
      </div>
      </div>
    </div>
  );
};



export default ProductCard;