import React, { useState, useEffect } from "react";
import "./MoveMultipleProductsModal.css";
import FormSelect from "../../../common/FormSearchSelect/FormSearchSelect";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { imageUrl } from "../../../../helper/helper";
import { ImageNotFound } from "../../../../assets/icons";

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 6L18 18" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.6667 3.5L5.25 9.91667L2.33333 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const moveSchema = z.object({
  store: z.string().min(1, "Please select a store"),
});

const MoveMultipleProductsModal = ({
  isOpen,
  onClose,
  products = [],
  stores = [],
  onMove,
  loading = false,
}) => {
  const { control, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(moveSchema),
    defaultValues: { store: "" },
  });

  const [checkedProducts, setCheckedProducts] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setCheckedProducts(products.map((p) => p.id));
      reset({ store: "" });
    }
  }, [isOpen, products, reset]);

  if (!isOpen) return null;

  const handleToggleProduct = (productId) => {
    setCheckedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const onSubmit = (data) => {
    if (checkedProducts.length === 0) return;
    onMove?.(checkedProducts, data.store);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="move-multi-overlay" onClick={handleOverlayClick}>
      <div className="move-multi-modal">
        <div className="move-multi-header">
          <h2 className="move-multi-title">Move to</h2>
          <button className="move-multi-close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="move-multi-body">
            <div className="move-multi-field">
              <label className="move-multi-label-one">Store Name</label>
              <FormSelect
                label=""
                placeholder="Store Name"
                error={errors.store?.message}
                variant="bordered"
                bgColor="var(--color-white)"
                style={{ padding: "15px 20px" }}
                styleLabel={{ marginBottom: "0px" }}
                control={control}
                name="store"
                options={stores}
              />
            </div>

            <div className="move-multi-field">
              <label className="move-multi-label">Product</label>
              <p className="move-multi-subtitle">
                {checkedProducts.length} products were selected for move to other store
              </p>

              <div className="move-multi-product-list">
                {products.map((product, index) => {
                  const isChecked = checkedProducts.includes(product.id);
                  const imgSrc = product?.mediaList?.[0]?.mediaId
                    ? `${imageUrl}${product.mediaList[0].mediaId}`
                    : product?.image || ImageNotFound;
                  const name = product?.productTitle_i18n?.en || product?.name || "";

                  return (
                    <div key={product.id}>
                      <div className="move-multi-product-row">
                        <div
                          className={`move-multi-checkbox ${isChecked ? "checked" : ""}`}
                          onClick={() => handleToggleProduct(product.id)}
                        >
                          {isChecked && <CheckIcon />}
                        </div>
                        <div className="move-multi-product-divider" />
                        <div className="move-multi-product-image">
                          <img src={imgSrc} alt={name} />
                        </div>
                        <span className="move-multi-product-name">{name}</span>
                      </div>
                      {index < products.length - 1 && (
                        <div className="move-multi-row-separator" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="move-multi-footer">
            <button
              type="submit"
              className="move-multi-btn"
              disabled={loading || checkedProducts.length === 0}
            >
              {loading ? "Moving..." : "Move"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MoveMultipleProductsModal;