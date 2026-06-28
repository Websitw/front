import SawaSlider from "../SawaSlider/SawaSlider";
import ViewAllCard from "../ViewAllCard/ViewAllCard";
import TopSection from "../SawaSlider/TopSection";
import "./RecommendedSlider.css";
import RecommendedImg from "../../assets/image/Recommended.png";

// import Recommended from '../../assets//image';

const RecommendedSlider = ({products, handleOpenViewProduct, handleAddtoCart}) => {
  return (
    <>
      <TopSection title="Recommended" />
      <div className="recommended-slider-container">
        <div className="recommended-slider-section">
        <ViewAllCard
              image={RecommendedImg}
          title="Recommended for You"
        />
        </div>
        <SawaSlider onAddToCart={handleAddtoCart}  title="Recommended" products={products} handleOpenViewProduct={handleOpenViewProduct} />
      </div>
    </>
  );
};

export default RecommendedSlider;
