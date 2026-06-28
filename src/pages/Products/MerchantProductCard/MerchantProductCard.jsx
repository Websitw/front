import { EditIcon, Trash } from "../../../assets/icons";
import "./MerchantProductCard.css";

const MerchantProductCard = ({
  logo,
  inventoryName,
  plan,
  storageUsed,
  storageTotal,
  selected,
  onSelect,
  onUpgrade,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      className={`merchant-product-card ${selected ? "selected" : ""}`}
      onClick={onSelect}
    >
      <div className="merchant-product-card__top-row">
        <div className="merchant-product-card__radio">
          <span className="merchant-product-card__radio-dot"></span>
        </div>
        <div className="merchant-product-card__actions">
          <button
            className="merchant-product-card__action-btn"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
          >
            <EditIcon size={16} />
          </button>
          <button
            className="merchant-product-card__action-btn merchant-product-card__action-btn--danger"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
          >
            <Trash size={16} />
          </button>
        </div>
      </div>
      <div className="merchant-product-card__logo">
        <img src={logo} alt={inventoryName} />
      </div>
      <div className="merchant-product-card__info">
        <h4 className="merchant-product-card__name">{inventoryName}</h4>
        <p className="merchant-product-card__plan">{plan}</p>
        <p className="merchant-product-card__storage">
          Storage space ({storageUsed}/{storageTotal})
        </p>
        <button
          className="merchant-product-card__upgrade"
          onClick={(e) => {
            e.stopPropagation();
            onUpgrade?.();
          }}
        >
          Upgrade Plan
        </button>
      </div>
    </div>
  );
};

export default MerchantProductCard;