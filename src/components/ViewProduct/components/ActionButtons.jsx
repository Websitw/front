import { Love, Share } from "../../../assets/icons";

const ActionButtons = ({ onShare, isWishlisted, onToggleWishlist }) => {
  return (
    <div className="action-buttons-view-product">
      <button
        type="button"
        className={`icon-action-btn ${isWishlisted ? "liked" : ""}`}
        onClick={onToggleWishlist}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Love
          size={20}
          fill={isWishlisted ? "#E63946" : "none"}
          stroke={isWishlisted ? "#E63946" : "#666"}
        />
      </button>
      <button
        type="button"
        className="icon-action-btn"
        aria-label="Share product"
        onClick={onShare}
      >
        <Share size={20} stroke="#666" />
      </button>
    </div>
  );
};

export default ActionButtons;