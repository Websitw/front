import "./FavoriteStores.css";

import FavoriteIcon from "@mui/icons-material/Favorite";
import StarIcon from "@mui/icons-material/Star";
import {
  fetchFavoriteBrands,
  removeFavoriteBrand,
} from "../../store/slices/favoriteBrandSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import useLocalStorage from "../../hooks/useLocalStorage";
import { imageUrl } from "../../helper/helper";
import ConfirmDialog from "../../components/Admin/Modal/Modal";
import { useTranslation } from "react-i18next";
import favoriteStoreEmpty from "../../assets/Photos/favoriteStoreEmpty.png";
import { useNavigate } from "react-router-dom";
import { setLoginOpen } from "../../store/slices/userSidebar";
import { buildBrandMarketPath } from "../../helper/brandRoutes";

const FavoriteStores = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navgation = useNavigate();
  const favoriteBrands = useSelector((state) => state.favoriteBrands.brands);
  const [userData] = useLocalStorage("userData", null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [removeLoading, setRemoveLoading] = useState(false);

  console.log("favoriteBrands>>>", selectedBrand);
  useEffect(() => {
    if (userData?.id) {
      dispatch(
        fetchFavoriteBrands({
          userId: userData?.id,
        }),
      );
    }
  }, [dispatch, userData?.id]);

  const handleRemoveClick = (brand) => {
    setSelectedBrand(brand);
    setConfirmOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!selectedBrand) return;
    setRemoveLoading(true);
    try {
      await dispatch(removeFavoriteBrand(selectedBrand?.brand?.id)).unwrap();
      dispatch(fetchFavoriteBrands({ userId: userData?.id }));
    } catch (error) {
      console.error("Failed to remove favorite brand:", error);
    } finally {
      setRemoveLoading(false);
      setConfirmOpen(false);
      setSelectedBrand(null);
    }
  };

  const handleCloseConfirm = () => {
    if (removeLoading) return;
    setConfirmOpen(false);
    setSelectedBrand(null);
  };

  const goToBrandTemplate = (brandId) => {
    navgation(buildBrandMarketPath(brandId));
    dispatch(setLoginOpen(false));
  };

  return (
    <div className="favorite-brand-container">
      <h2 className="page-title">Favorite Stores</h2>
      <h4 className="sub-title-brand">Favorite Brands</h4>

      {favoriteBrands.length == 0 && (
        <div className="empty-wishlist">
          <img src={favoriteStoreEmpty} alt="image not found" />
          <h2>
            Start following stores you love to keep up with their products
          </h2>
        </div>
      )}

      {favoriteBrands.map((brand) => {
        return (
          <div className="brand-card" key={brand.id}>
            <div className="brand-image">
              <img src={`${imageUrl}${brand?.brand?.logoId}`} alt="brand" />
              <div className="brand-overlay">{brand?.brand?.brandName}</div>
            </div>

            <div className="brand-content">
              <div className="brand-header">
                <h2>{brand?.brand?.brandName}</h2>
              </div>

              <p className="brand-desc">
                {brand?.brand?.brandDescription_i18n?.en ||
                  "No description available"}
              </p>

              <div className="rating">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="star filled" />
                ))}
                <span className="rating-value">4.9</span>
                <span className="rating-count">(200)</span>
              </div>

              <div className="actions">
                <div
                  className="icon-btn heart"
                  onClick={() => handleRemoveClick(brand)}
                >
                  <FavoriteIcon />
                </div>

                <div className="icon-btn star-outline">
                  <StarIcon />
                </div>

                <span className="rate-text">
                  <strong>3.5</strong> Rate
                </span>
              </div>
            </div>

            <div
              className="brand-cta"
              onClick={() => goToBrandTemplate(brand?.brand?.id)}
              style={{ cursor: "pointer" }}
            >
              <button>Shop Now</button>
            </div>
          </div>
        );
      })}

      <ConfirmDialog
        open={confirmOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmRemove}
        title={t(
          "confirm_dialog.remove_favorite_title",
          "Remove from Favorites",
        )}
        message={t(
          "confirm_dialog.remove_favorite_message",
          `Are you sure you want to remove "${selectedBrand?.brand?.brandName}" from your favorites?`,
        )}
        loading={removeLoading}
      />
    </div>
  );
};

export default FavoriteStores;
