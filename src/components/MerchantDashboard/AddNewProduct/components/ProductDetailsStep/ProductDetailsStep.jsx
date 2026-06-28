import "./ProductDetailsStep.css";
import ProductImagesInput from "../MediaTab/MediaTab";

const ProductDetailsStep = ({ control, errors }) => {
  return (
    <div className="product-details-step">
      <ProductImagesInput
        maxImages={5}
        name="mediaList"
        control={control}
        error={errors?.mediaList?.message}
      />
    </div>
  );
};

export default ProductDetailsStep;