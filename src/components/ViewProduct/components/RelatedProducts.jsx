import ProductCard from "../../ProductCard/ProductCard";
import { imageUrl } from "../../../helper/helper";


const RelatedProducts = ({ products = [], handleOpenViewProduct, onAddToCart }) => {
  if (!products.length) return null;

  return (
    <div className="related-products-section">
      <h3 className="related-products-title">Products related to this item</h3>
      <div className="related-products-grid">
        {products.map((product, index) => (
          <ProductCard
            id={product.id}
            image={`${imageUrl}${product.mediaList?.[0]?.mediaId}`}
            title={product.productTitle_i18n?.en}
            rating={product.rating}
            reviewCount={product.ratingCount}
            currentPrice={
              product?.price?.JO?.hasWholesalePrice
                ? product.price?.JO?.salePrice
                : product.price?.JO?.listPrice
            }
            originalPrice={product.price?.JO?.listPrice}
            currency={product.price?.JO?.currencyCode}
            discountPercentage={product.price?.JO?.salePercent}
            stockLeft={product.stockLevel}
            deliveryText={"Deliver To Your Location"}
            // timerText={product.timerText}
            product={product}
            onAddToCart={onAddToCart}
            // onCardClick={onProductClick}
            handleOpenViewProduct={() => handleOpenViewProduct(product)}
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
