import './SawaSlider.css';
import { useNavigate } from "react-router-dom";

const TopSection = ({ title }) => {
  const navigate = useNavigate();

  const ArrowRightIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M9 18L15 12L9 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const handleViewAll = () => {
    navigate("/search");
  };

  return (
    <>
      <div className="best-seller-section__header">
        <div className="best-seller-section__title-wrapper">
          <h2 className="best-seller-section__title">{title}</h2>
        </div>

        <button
          className="best-seller-section__view-all"
          onClick={handleViewAll}
        >
          View All
          <ArrowRightIcon />
        </button>
      </div>

      <div className="best-seller-section__title-underline">
        <div className="best-seller-section__title-underline-active"></div>
      </div>
    </>
  );
};

export default TopSection;
