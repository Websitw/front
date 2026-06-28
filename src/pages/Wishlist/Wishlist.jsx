
import React, { useState, useEffect } from "react";
import "./Wishlist.css";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LocationPinIcon from "@mui/icons-material/LocationPin";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { useWishlist } from "../../hooks/useWishlist";
import LoadingSpinner from "../../components/common/LoadingSpinner/LoadingSpinner";
import { imageUrl } from "../../helper/helper";
import wilshListEmpty from "../../assets/Photos/wilshListEmpty.png";
import brokeImage from "../../assets/icons/imageNotFound.png";
import StarRating from "../../components/common/StarRating/StarRating";

const DEFAULT_COUNTRY = "JO";

const getSkuImage = (sku) => {
  const media = sku?.mediaList?.find((m) => m.type === "IMAGE");
  return media ? `${imageUrl}${media.mediaId}` : "";
};

const getSkuPricing = (sku) => {
  const pricing =
    sku?.price?.[DEFAULT_COUNTRY] || Object.values(sku?.price || {})[0];
  const now = Date.now();

  const isOnSale =
    pricing?.salePrice > 0 &&
    now >= pricing?.saleStart &&
    now <= pricing?.saleEnd;

  return {
    listPrice: pricing?.listPrice || 0,
    salePrice: isOnSale ? pricing?.salePrice : 0,
    salePercent: isOnSale ? pricing?.salePercent : 0,
    currencyCode: pricing?.currencyCode || "JOD",
    hasWholesalePrice: pricing?.hasWholesalePrice || false,
    isOnSale,
  };
};

const Wishlist = () => {
  const { wishlistItems, loading, getWishlist, removeItem } = useWishlist();
  const [openModal, setOpenModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    getWishlist();
  }, []);

  const handleRemoveClick = (item) => {
    setSelectedItem(item);
    setOpenModal(true);
  };

  const handleConfirmRemove = () => {
    if (!selectedItem) return;

    removeItem(selectedItem?.sku?.id).then((result) => {
      if (result.success) {
        setOpenModal(false);
        setSelectedItem(null);
        getWishlist();
      }
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="wishlist-container">
      <div className="main-wishlist">
        <h2 className="wishlist-title">My Wishlist</h2>

        <div className="wishlist-count">
          ({wishlistItems?.length || 0}) Item Saved
        </div>

        {wishlistItems.length === 0 && (
          <div className="empty-wishlist">
            <img src={wilshListEmpty} alt="image not found" />
            <h2>Start saving items you love to see them here</h2>
          </div>
        )}

        <div className="wishlist-list">
          {wishlistItems?.map((item) => {
            const { sku } = item;
            const pricing = getSkuPricing(sku);
            const image = getSkuImage(sku);
            const title = sku?.productTitle_i18n?.en || sku?.productTitle || "";
            const stock = sku?.inventory?.availableToSell || 0;
            const rating = sku?.rating || 0;
            const ratingCount = sku?.ratingCount || 0;

            return (
              <div className="wishlist-card" key={item.id}>
                <div className="wishlist-image">
                  <img
                    src={image && image.trim() !== "" ? image : brokeImage}
                    alt={title}
                    onError={(e) => {
                      if (e.target.src !== brokeImage) {
                        e.target.src = brokeImage;
                      }
                    }}
                  />
                </div>

                <div className="wishlist-info">
                  <h3>{title}</h3>

                  <StarRating rating={rating} ratingCount={ratingCount} />

                  <div className="deliver">
                    <LocationPinIcon fontSize="small" />
                    <p>Deliver To Jordan</p>
                  </div>

                  <div className="price-row">
                    <span className="price">
                      {pricing.currencyCode}{" "}
                      {pricing.salePrice || pricing.listPrice}
                    </span>
                    {pricing.salePercent > 0 && (
                      <span className="old-price">
                        {pricing.currencyCode} {pricing.listPrice}
                      </span>
                    )}
                    <span className={`stock ${stock <= 0 ? "out" : ""}`}>
                      {stock <= 0 ? "Out Of Stock" : `Only ${stock} Left`}
                    </span>
                  </div>
                </div>

                <div className="wishlist-actions">
                  <div className="icons">
                    <button
                      className="heart-btn"
                      onClick={() => handleRemoveClick(item)}
                    >
                      <FavoriteIcon />
                    </button>

                    <button className="share-btn">
                      <ShareOutlinedIcon />
                    </button>
                  </div>

                  <button className="add-cart">Add to Cart</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {openModal && (
        <>
          <div
            className="wishlist-overlay"
            onClick={() => setOpenModal(false)}
          />

          <div className="wishlist-modal">
            <button className="modal-close" onClick={() => setOpenModal(false)}>
              <CloseIcon />
            </button>

            <div className="modal-heart">
              <FavoriteIcon fontSize="large" />
            </div>

            <h3>Remove from My Wishlist</h3>

            <p>This product will be removed from your favorites.</p>

            <div className="modal-actions">
              <button className="remove-btn" onClick={handleConfirmRemove}>
                Yes, Remove it
              </button>

              <button
                className="cancel-btn"
                onClick={() => setOpenModal(false)}
              >
                Cancel, keep It
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Wishlist;