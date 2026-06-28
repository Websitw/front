import { useState, useRef, useEffect, useMemo } from "react";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import "./ViewProduct.css";
import { z } from "zod";
import { X, MapPin } from "lucide-react";
import ImageGallery from "./components/ImageGallery";
import AddToCartButton from "./components/AddToCartButton";
import TabSelector from "./components/TabSelector";
import SpecRow from "./components/SpecRow";
import ExpandableSection from "./components/ExpandableSection";
import PriceDisplay from "./components/PriceDisplay";
import ActionButtons from "./components/ActionButtons";
import SizeSelector from "./components/SizeSelector";
import PurchaseTypeToggle from "./components/PurchaseTypeToggle";
import QuantityInput from "./components/QuantityInput";
import { Compare } from "../../assets/icons";
import CustomerReview from "../common/CustomerReview";
import LoadingSpinner from "../common/LoadingSpinner/LoadingSpinner";
import PdfViewer from "./components/PdfViewer";
import { findSkuByVariants } from "../../helper/mapProductDetails";
import RelatedProducts from "./components/RelatedProducts";
import { getItemSkuPrice } from "../../helper/helper";
import StarRating from "../common/StarRating/StarRating";
const buildProductSchema = (variantAttributes = []) => {
  const shape = {
    quantity: z
      .number()
      .min(1, "Minimum quantity is 1")
      .max(99, "Maximum quantity is 99"),
    purchaseType: z.enum(["retail", "wholesale"]),
  };

  variantAttributes.forEach((attr) => {
    shape[attr.key] = z.string().optional();
  });

  return z.object(shape);
};

function ViewProductForm({
  productData,
  onOpenGallery,
  onOpenShare,
  addToCart,
  isWishlisted,
  onToggleWishlist,
  isExpanded,
  relatedProducts,
  onRelatedProductClick,
  onRelatedAddToCart,
  handleOpenViewProduct,
}) {
  const variantAttributes = productData.variantAttributes || [];
  const [activeTab, setActiveTab] = useState("about");
  const handleOpenShare = () => {
    onOpenShare?.(
      `https://Sawa.com/product/${productData.slug || productData.id}`,
    );
  };
  const handleOpenGallery = () => {
    onOpenGallery?.({
      images: activeMedia.images,
      videoThumbnail: activeMedia.videoThumbnail,
    });
  };
  const productSchema = useMemo(
    () => buildProductSchema(variantAttributes),
    [variantAttributes],
  );
console.log("variantAttributes>>",variantAttributes)
  const defaultVariantValues = useMemo(() => {
    const defaults = {};
    variantAttributes.forEach((attr) => {
      defaults[attr.key] = attr.options?.[0]?.value || "";
    });
    return defaults;
  }, [variantAttributes]);

  const methods = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      ...defaultVariantValues,
      quantity: 1,
      purchaseType: "retail",
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = methods;

  const watchedVariants = watch(variantAttributes.map((a) => a.key));
  const watchedQuantity = watch("quantity");
  const watchedPurchaseType = watch("purchaseType");

  const selectedVariants = useMemo(() => {
    const result = {};
    variantAttributes.forEach((attr, i) => {
      if (watchedVariants[i]) result[attr.key] = watchedVariants[i];
    });
    return result;
  }, [variantAttributes, watchedVariants]);

  const activeSku = useMemo(() => {
    if (!productData.skus?.length) return null;
    return findSkuByVariants(productData.skus, selectedVariants);
  }, [productData.skus, selectedVariants]);

  const activePrice = useMemo(() => {
    if (!activeSku) {
      return {
        listPrice: productData.currentPrice || 0,
        originalPrice: productData.originalPrice || 0,
        salePercent: productData.salePercent || 0,
        currency: productData.currency || "JOD",
        stock: productData.stock || 0,
        hasWholesalePrice: false,
        wholesalePriceList: [],
      };
    }

    if (watchedPurchaseType === "wholesale" && activeSku.hasWholesalePrice) {
      const applicableTier = [...activeSku.wholesalePriceList]
        .sort((a, b) => b.minQty - a.minQty)
        .find((tier) => watchedQuantity >= tier.minQty);

      return {
        listPrice: applicableTier?.price || activeSku.listPrice,
        originalPrice: activeSku.originalPrice,
        salePercent: activeSku.salePercent,
        currency: activeSku.currencyCode,
        stock: activeSku.stock,
        hasWholesalePrice: true,
        wholesalePriceList: activeSku.wholesalePriceList,
        isWholesaleActive: !!applicableTier,
      };
    }
    const { displayPrice, originalPrice } = getItemSkuPrice(activeSku);
    return {
      listPrice: displayPrice,
      originalPrice: originalPrice,
      salePercent: activeSku.salePercent,
      currency: activeSku.currencyCode,
      stock: activeSku.stock,
      hasWholesalePrice: activeSku.hasWholesalePrice,
      wholesalePriceList: activeSku.wholesalePriceList,
    };
  }, [activeSku, watchedPurchaseType, watchedQuantity, productData]);

  const activeSpecs = useMemo(() => {
    if (!activeSku) return productData.specs || {};

    return {
      dimensions: activeSku.dimensions || productData.specs?.dimensions || "",
      weight: activeSku.weight || productData.specs?.weight || "",
      barcode: activeSku.barcode || productData.specs?.barcode || "",
      returnPolicy: productData.specs?.returnPolicy || "",
    };
  }, [activeSku, productData.specs]);

  const activeMedia = useMemo(() => {
    const skuImages = activeSku?.images;
    const skuVideo = activeSku?.videoThumbnail;

    return {
      images: skuImages?.length > 0 ? skuImages : productData.images,
      videoThumbnail: skuVideo || productData.videoThumbnail,
    };
  }, [activeSku, productData.images, productData.videoThumbnail]);

  useEffect(() => {
    if (
      watchedPurchaseType === "wholesale" &&
      activePrice.wholesalePriceList?.length > 0
    ) {
      const minWholesaleQty = activePrice.wholesalePriceList[0].minQty;
      if (watchedQuantity < minWholesaleQty) {
        methods.setValue("quantity", minWholesaleQty);
      }
    }
  }, [watchedPurchaseType, activePrice.wholesalePriceList]);

  const handleToggleWishlist = () => {
    onToggleWishlist?.(productData, activeSku);
  };

  const onSubmit = (data) => {
    const cartPayload = {
      id: activeSku?.id,
      lineQuantity: data.quantity,
      lineType: data.purchaseType,
      merchantId: productData.merchantId,
      inventory: {
        physicalStoreId: activeSku?.physicalStoreId || "",
      },
    };
    addToCart(cartPayload);
  };

  const infoTabs = [
    { label: "About Item", value: "about" },
    { label: "Reviews", value: "reviews" },
    { label: "Seller Info", value: "seller" },
  ];

  const galleryBlock = (
    <ImageGallery
      handleOpenModal={handleOpenGallery}
      images={activeMedia.images}
      videoThumbnail={activeMedia.videoThumbnail}
    />
  );


  const productInfoBlock = (
    <div className="product-info-view-product">
      <h2 className="product-name-view-product">{productData.name}</h2>

      <div className="rating-row">
        <StarRating rating={productData.rating} ratingCount={productData.reviewCount}/>
        {/* <CustomerReview
          starSize={12}
          readOnly={true}
          value={productData.rating}
        />
        <span className="review-count">({productData.reviewCount})</span> */}
      </div>

      <div className="delivery-row">
        <MapPin size={14} className="delivery-icon" />
        <span>Deliver To {productData.deliverTo}</span>
      </div>

      <div className="price-action-row">
        <PriceDisplay
          currentPrice={activePrice.listPrice}
          originalPrice={activePrice.originalPrice}
          salePercent={activePrice.salePercent}
          currency={activePrice.currency}
          stock={activePrice.stock}
          isStockVisible={activeSku?.isStockVisible}
          purchaseType={watchedPurchaseType}
          wholesalePriceList={activePrice.wholesalePriceList}
        />
        <ActionButtons
          onShare={handleOpenShare}
          isWishlisted={activeSku?.isFavorite}
          onToggleWishlist={handleToggleWishlist}
        />
      </div>

      {variantAttributes.map((attr) => (
        <Controller
          key={attr.key}
          name={attr.key}
          control={control}
          render={({ field }) => (
            <SizeSelector
              label={attr.label}
              sizes={attr.options}
              value={field.value}
              onChange={field.onChange}
              error={errors[attr.key]?.message}
            />
          )}
        />
      ))}

      {activePrice.hasWholesalePrice && (
        <Controller
          name="purchaseType"
          control={control}
          render={({ field }) => (
            <PurchaseTypeToggle
              value={field.value}
              onChange={field.onChange}
              hasWholesale={activePrice.hasWholesalePrice}
            />
          )}
        />
      )}
      <div className={`${isExpanded ? "expanded-cart-row" : ""}`}>
        <div className="cart-row">
          <Controller
            name="quantity"
            control={control}
            render={({ field }) => (
              <QuantityInput
                value={field.value}
                onChange={field.onChange}
                error={errors.quantity?.message}
                min={
                  watchedPurchaseType === "wholesale" &&
                  activePrice.wholesalePriceList?.length > 0
                    ? activePrice.wholesalePriceList[0].minQty
                    : 1
                }
              />
            )}
          />
          <AddToCartButton onClick={handleSubmit(onSubmit)} />
        </div>

        <div className="shipping-row">
          <span className="shipping-title">Shipping & Delivery Fee</span>
          <span className="shipping-price">
            {activePrice.currency}
            <span className="ship-main">
              {Math.floor(productData.shippingFee)}
            </span>
            .
            <span className="ship-decimals">
              {String(Math.round((productData.shippingFee % 1) * 100)).padStart(
                2,
                "0",
              )}
            </span>
          </span>
        </div>
      </div>
    </div>
  );

  const infoSectionBlock = (
    <div className="info-section">
      <TabSelector
        tabs={infoTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === "about" && (
        <div className="tab-content about-content">
          <h4 className="tab-content-title">Description</h4>
          <p className="description-text">{productData.description}</p>

          <div className="specs-table">
            <SpecRow label="Brand Name" value={productData.brand} />
            <SpecRow label="Product Category" value={productData.category} />
            {activeSpecs.dimensions && (
              <SpecRow label="Dimensions" value={activeSpecs.dimensions} />
            )}
            {activeSpecs.weight && (
              <SpecRow label="Weight" value={activeSpecs.weight} />
            )}
            {activeSpecs.barcode && (
              <SpecRow label="Barcode" value={activeSpecs.barcode} />
            )}
            {activeSku?.mpn && <SpecRow label="MPN" value={activeSku.mpn} />}
            <SpecRow label="Return Policy" value={activeSpecs.returnPolicy} />
            {productData.staticAttributes?.map((attr) => (
              <SpecRow key={attr.key} label={attr.label} value={attr.value} />
            ))}
          </div>

          <div className="expandable-list">
            {productData.howToUse && (
              <ExpandableSection title="How to use">
                <p>{productData.howToUse}</p>
              </ExpandableSection>
            )}
            {productData.catalog && (
              <ExpandableSection title="Catalog">
                <PdfViewer url={productData.catalog} />
              </ExpandableSection>
            )}
          </div>
        </div>
      )}

      {activeTab === "reviews" && (
        <div className="tab-content reviews-content">
          {productData.reviews?.length > 0 ? (
            productData.reviews.map((review, index) => (
              <div key={index} className="review-item">
                <div className="review-header">
                  <div className="review-user-info">
                    <div className="review-avatar">
                      {review.username
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div className="review-user-details">
                      <span className="review-username">{review.username}</span>
                      <span className="review-date">
                        {new Date(review.createdAt).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="review-rating-info">
                    <StarRating rating={review.rating}/>
                    {/* <CustomerReview
                      starSize={14}
                      readOnly={true}
                      value={review.rating}
                    /> */}
                  </div>
                </div>
                <p className="review-content">{review.content}</p>
              </div>
            ))
          ) : (
            <p className="no-reviews">No reviews yet.</p>
          )}
        </div>
      )}

      {activeTab === "seller" && (
        <div className="tab-content seller-content">
          <SpecRow label="Store Name" value={productData.storeName} />
          <SpecRow label="Brand Name" value={productData.brand} />
          <SpecRow
            label="Official Seller"
            value={productData.isOfficialSeller ? "Yes" : "No"}
          />
          <SpecRow
            label="Location"
            value={
              productData.storeCity
                ? `${productData.storeCity}, ${productData.deliverTo}`
                : productData.deliverTo
            }
          />
        </div>
      )}
    </div>
  );

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {isExpanded ? (
          <div className="expanded-layout">
            <div className="expanded-left-col">
              {galleryBlock}
              <RelatedProducts
                products={relatedProducts}
                onProductClick={onRelatedProductClick}
                onAddToCart={addToCart}
                handleOpenViewProduct={handleOpenViewProduct}
              />
            </div>
            <div className="expanded-right-col">
              {productInfoBlock}
              {infoSectionBlock}
            </div>
          </div>
        ) : (
          <>
            {galleryBlock}
            {productInfoBlock}
            {infoSectionBlock}
          </>
        )}
      </form>
    </FormProvider>
  );
}

function ViewProductModal({
  isOpen,
  onClose,
  productData,
  isLoading = false,
  handleOpenCompare,
  isCompareOpen,
  showCompareLabel = false,
  isSecondary = false,
  handleCompareIconClick,
  onOpenGallery,
  onOpenShare,
  addToCart,
  isWishlisted,
  onToggleWishlist,
  relatedProducts = [],
  onRelatedProductClick,
  onRelatedAddToCart,
  handleOpenViewProduct,
}) {
  const modalRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setIsExpanded(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isCompareOpen) {
      setIsExpanded(false);
    }
  }, [isCompareOpen]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleToggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div onClick={handleOverlayClick}>
      <div
        className={`product-modal ${isOpen ? "slide-in" : ""} ${isSecondary ? "secondary" : ""} ${isExpanded ? "expanded" : ""}`}
        ref={modalRef}
      >
        {showCompareLabel && !isExpanded && (
          <div
            className="compare-product-label"
            onClick={handleCompareIconClick}
          >
            <span>Compare Product</span>
          </div>
        )}

        {isOpen && !isCompareOpen && !isSecondary && (
          <div className="expand-page-tab" onClick={handleToggleExpand}>
            <span className="resize-handle"></span>
          </div>
        )}

        <div className="modal-header-view-product">
          <div className="modal-logo" onClick={handleOpenCompare}>
            <Compare
              className={`compare-icon ${isCompareOpen && !isSecondary ? "active" : ""}`}
            />
          </div>
          <button
            type="button"
            className="close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={22} />
          </button>
        </div>

        <div className="modal-body">
          {isLoading ? (
            <div className="modal-loading">
              <div className="modal-loading-spinner" />
              <LoadingSpinner />
            </div>
          ) : !productData ? (
            <div className="modal-error">
              <p>Failed to load product details.</p>
            </div>
          ) : (
            <ViewProductForm
              key={productData.id}
              productData={productData}
              onOpenGallery={onOpenGallery}
              onOpenShare={onOpenShare}
              addToCart={addToCart}
              isWishlisted={isWishlisted}
              onToggleWishlist={onToggleWishlist}
              isExpanded={isExpanded}
              relatedProducts={relatedProducts}
              onRelatedProductClick={onRelatedProductClick}
              onRelatedAddToCart={onRelatedAddToCart}
              handleOpenViewProduct={handleOpenViewProduct}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewProductModal;
