import ViewAllCard from "../ViewAllCard/ViewAllCard";
import SawaSlider from "../SawaSlider/SawaSlider";
import "./ShopLess.css";
import TopSection from "../SawaSlider/TopSection";
import Fashion from "../../assets/image/Fashion.png";
import Baby from "../../assets/image/Baby.jpg";
const ShopLess = ({ products, productsTwo, handleOpenViewProduct, handleAddtoCart }) => {
  return (
    <div>
      <TopSection title="Shop For Less" />
      <div className="shop-less-container">
        <ViewAllCard bgColor="#ED7677" hasOverlay={true} title="Shop Newest Products" image={Baby}/>
        <SawaSlider
          onAddToCart={handleAddtoCart}
          products={products}
          handleOpenViewProduct={handleOpenViewProduct}
        />
      </div>
      <div className="shop-less-container">
        <ViewAllCard bgColor="#ED7677" title="Top Rated Product"  image={Fashion}/>
        <SawaSlider
          onAddToCart={handleAddtoCart}
          products={productsTwo}
          handleOpenViewProduct={handleOpenViewProduct}
        />
      </div>
    </div>
  );
};

export default ShopLess;
