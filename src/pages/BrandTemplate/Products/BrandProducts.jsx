import React, { useState } from "react";
import "./BrandProducts.css";

import ProductCard from "../../../components/ProductCard/ProductCard";

import useCart from "../../../hooks/useCart";
import { useViewProduct } from "../../../context/ViewProductContext";
import { ImageNotFound } from "../../../assets/icons";
import { imageUrl } from "../../../helper/helper";
import { useNavigate } from "react-router-dom";
import { setBrandFilterOpen } from "../../../store/slices/userSidebar";
import { useDispatch } from "react-redux";
import LoadinerSpinner from "../../../components/common/LoadingSpinner/LoadingSpinner";
const BrandProducts = ({ items, brandId, loading }) => {
  const [activeCategory, setActiveCategory] = useState("Body Care");
  const [activeFilter, setActiveFilter] = useState("All");
    const navigate = useNavigate();
  const { addNewItemToCart } = useCart();
  const { openViewProduct } = useViewProduct();
    const dispatch = useDispatch();

  const categories = ["Body Care", "Hair Care", "Skin Care", "Makeup"];
  const filters = ["All", "Body", "Face", "Skin", "Other"];

  const handleViewall = () => {
    navigate(`/search-brand?brandId=${brandId}`)
    dispatch(setBrandFilterOpen(true))
  }
  console.log(items, "brand products")
  return (
    <div className="brand-product-wrapper">
      <div className="category-wrapper">
        <div className="category-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`tab ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              No data Founded
              {/* {cat} */}
            </button>
          ))}
        </div>

        <div className="filter-tabs">
          {filters.map((filter, index) => (
            <button
              key={index}
              className={`filter ${activeFilter === filter ? "active" : ""}`}
              onClick={() => setActiveFilter(filter)}
            >
              No data 
              {/* {filter} */}
            </button>
          ))}
        </div>

        <div className="section-header">
          <h2>New Products</h2>
          <span onClick={()=> handleViewall()} className="view-all">View All</span>
        </div>

        <div className="productsGrid">
          {loading ? (
            <>
            <LoadinerSpinner />
            </> 
          ) : (
            <>
          {items?.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              image={
                product.mediaList[0]?.mediaId
                  ? `${imageUrl}${product.mediaList[0]?.mediaId}`
                  : ImageNotFound
              }
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
              deliveryText="Deliver To Your Location"
              product={product}
              onAddToCart={addNewItemToCart}
              handleOpenViewProduct={() => openViewProduct(product)}
            />
          ))}
          </>
         )}
         
        </div>
           {!items && !loading && (
            <div className="no-products">
              <h3>No products found in this brand.</h3>
            </div>
          )}
      </div>
    </div>
  );
};

export default BrandProducts;
