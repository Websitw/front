import "./WarningModal.css";
import { HugeWarning, SmallWarning } from "../../assets/icons";

const CloseIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1 1L14 14M14 1L1 14"
      stroke="#151515"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export default function WarningModal({
  open = true,
  title = "Some Items Were Excluded",
  noteText = "Some items in your cart are currently unavailable or cannot be delivered to your location. These items have not been included in your order total.",
  exclusions = [],
  primaryLabel = "Continue To Checkout",
  secondaryLabel = "Edit My Cart",
  onPrimary,
  onSecondary,
  onClose,
}) {
  if (!open) return null;

  return (
    <div className="warning-modal__overlay" onClick={onClose}>
      <div
        className="warning-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="warning-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          <CloseIcon />
        </button>

        <div className="warning-modal__icon">
          <HugeWarning />
        </div>

        <h2 className="warning-modal__title">{title}</h2>

        {noteText && (
          <div className="warning-modal__note">
            <p className="warning-modal__note-text">
              <span className="warning-modal__note-label">Note : </span>
              {noteText}
            </p>
          </div>
        )}

        {exclusions.length > 0 && (
          <ul className="warning-modal__exclusions">
            {exclusions.map((item, index) => (
              <li key={index} className="warning-modal__exclusion-item">
                <SmallWarning />
                <span className="warning-modal__exclusion-text">
                  {item.reason}
                  <span className="warning-modal__exclusion-count">
                    {" "}({item.count}) item
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="warning-modal__actions">
          <button
            className="warning-modal__btn warning-modal__btn--primary"
            onClick={onPrimary}
          >
            {primaryLabel}
          </button>
          <button
            className="warning-modal__btn warning-modal__btn--secondary"
            onClick={onSecondary}
          >
            {secondaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}