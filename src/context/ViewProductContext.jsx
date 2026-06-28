import { createContext, useContext, lazy, Suspense, useState } from "react";

const ViewProductModalController = lazy(() => import("./ViewProductModalController"));

const ViewProductContext = createContext({ openViewProduct: () => {} });

export const useViewProduct = () => useContext(ViewProductContext);

export const ViewProductProvider = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [secondProductId, setSecondProductId] = useState(null);
  const [galleryData, setGalleryData] = useState(null);
  const [shareUrl, setShareUrl] = useState(null);

  const shouldLoadModalController = Boolean(
    isModalOpen ||
      isSecondModalOpen ||
      selectedProductId ||
      secondProductId ||
      galleryData ||
      shareUrl,
  );

  const openViewProduct = (product) => {
    const productId = product.productId || product.id;

    if (isCompareOpen) {
      setSecondProductId(productId);
      setIsSecondModalOpen(true);
      setIsModalOpen(true);
    } else {
      setSelectedProductId(productId);
      setIsModalOpen(true);
      setIsSecondModalOpen(false);
      setIsCompareOpen(false);
    }
  };

  return (
    <ViewProductContext.Provider value={{ openViewProduct }}>
      {children}

      {shouldLoadModalController ? (
        <Suspense fallback={null}>
          <ViewProductModalController
            isModalOpen={isModalOpen}
            isCompareOpen={isCompareOpen}
            isSecondModalOpen={isSecondModalOpen}
            selectedProductId={selectedProductId}
            secondProductId={secondProductId}
            galleryData={galleryData}
            shareUrl={shareUrl}
            setIsModalOpen={setIsModalOpen}
            setIsCompareOpen={setIsCompareOpen}
            setIsSecondModalOpen={setIsSecondModalOpen}
            setSelectedProductId={setSelectedProductId}
            setSecondProductId={setSecondProductId}
            setGalleryData={setGalleryData}
            setShareUrl={setShareUrl}
            openViewProduct={openViewProduct}
          />
        </Suspense>
      ) : null}
    </ViewProductContext.Provider>
  );
};