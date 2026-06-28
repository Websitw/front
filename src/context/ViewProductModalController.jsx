import { useEffect } from "react";
import {
  useGetBestSellersProductsQuery,
  useGetProductDetailsQuery,
} from "../store/slices/productsSlice";
import { mapProductDetails } from "../helper/mapProductDetails";
import ViewProductModal from "../components/ViewProduct/ViewProduct";
import ImageGalleryModal from "../components/ViewProduct/components/ImageVideosModal/ImageGalleryModal";
import ShareProductModal from "../components/ViewProduct/components/ShareProductModal/ShareProductModal";
import useCart from "../hooks/useCart";
import { useWishlist } from "../hooks/useWishlist";
import useSearch from "../hooks/useSearch";

const ViewProductModalController = ({
  isModalOpen,
  isCompareOpen,
  isSecondModalOpen,
  selectedProductId,
  secondProductId,
  galleryData,
  shareUrl,
  setIsModalOpen,
  setIsCompareOpen,
  setIsSecondModalOpen,
  setSelectedProductId,
  setSecondProductId,
  setGalleryData,
  setShareUrl,
  openViewProduct,
}) => {
  const { addNewItemToCart } = useCart();
  const { toggleWishlist, getWishlist } = useWishlist();
  const { data: bestSellers } = useGetBestSellersProductsQuery();

  const {
    data: rawProductDetails,
    isLoading: isDetailsLoading,
    refetch: refetchFirst,
  } = useGetProductDetailsQuery(selectedProductId, {
    skip: !selectedProductId,
  });

  const { getRelatedProducts, relatedProducts } = useSearch();

  useEffect(() => {
    if (selectedProductId) {
      getRelatedProducts({ productId: selectedProductId });
    }
  }, [getRelatedProducts, selectedProductId]);

  const {
    data: rawSecondDetails,
    isLoading: isSecondLoading,
    refetch: refetchSecond,
  } = useGetProductDetailsQuery(secondProductId, {
    skip: !secondProductId,
  });

  const firstProductData = mapProductDetails(rawProductDetails);
  const secondProductData = mapProductDetails(rawSecondDetails);

  const handleOpenCompare = () => {
    if (isCompareOpen) {
      setIsCompareOpen(false);
      setIsSecondModalOpen(false);
    } else {
      setIsCompareOpen(true);
    }
  };

  const handleCloseFirstModal = () => {
    setIsModalOpen(false);
    setIsCompareOpen(false);
    setIsSecondModalOpen(false);
    setSelectedProductId(null);
    setSecondProductId(null);
  };

  const handleCloseSecondModal = () => {
    setIsSecondModalOpen(false);
    setSecondProductId(null);
  };

  const handleCompareIconClick = () => {
    setIsModalOpen(!isModalOpen);
    setIsSecondModalOpen(false);
  };

  const handleOpenGallery = (media) => setGalleryData(media);
  const handleCloseGallery = () => setGalleryData(null);
  const handleOpenShare = (url) => setShareUrl(url);
  const handleCloseShare = () => setShareUrl(null);

  const handleToggleWishlist = (productData, activeSku) => {
    toggleWishlist(productData, activeSku).then((result) => {
      if (result.success) {
        getWishlist();
        if (selectedProductId) {
          refetchFirst();
        }
        if (secondProductId) {
          refetchSecond();
        }
      }
    });
  };

  return (
    <>
      {isSecondModalOpen && secondProductData && (
        <ViewProductModal
          isOpen={isSecondModalOpen}
          onClose={handleCloseSecondModal}
          productData={secondProductData}
          isLoading={isSecondLoading}
          handleOpenCompare={handleOpenCompare}
          isCompareOpen={isCompareOpen}
          showCompareLabel={true}
          relatedProducts={bestSellers}
          isSecondary={true}
          onOpenGallery={handleOpenGallery}
          onOpenShare={handleOpenShare}
          addToCart={addNewItemToCart}
          isWishlisted={secondProductData?.isWishList}
          onToggleWishlist={handleToggleWishlist}
          handleAddtoCart={addNewItemToCart}
          handleOpenViewProduct={openViewProduct}
        />
      )}

      {firstProductData && (
        <ViewProductModal
          handleCompareIconClick={handleCompareIconClick}
          isOpen={isModalOpen}
          onOpenGallery={handleOpenGallery}
          onClose={handleCloseFirstModal}
          productData={firstProductData}
          isLoading={isDetailsLoading}
          relatedProducts={relatedProducts}
          handleOpenCompare={handleOpenCompare}
          isCompareOpen={isCompareOpen}
          onOpenShare={handleOpenShare}
          showCompareLabel={isCompareOpen && !isSecondModalOpen}
          addToCart={addNewItemToCart}
          isWishlisted={firstProductData?.isWishList}
          onToggleWishlist={handleToggleWishlist}
          handleOpenViewProduct={openViewProduct}
        />
      )}

      <ImageGalleryModal
        images={galleryData?.images || []}
        videoThumbnail={galleryData?.videoThumbnail}
        isOpen={!!galleryData}
        onClose={handleCloseGallery}
      />
      <ShareProductModal
        isOpen={!!shareUrl}
        onClose={handleCloseShare}
        productUrl={shareUrl || ""}
      />
    </>
  );
};

export default ViewProductModalController;
