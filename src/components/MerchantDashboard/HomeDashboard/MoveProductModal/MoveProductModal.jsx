import React from "react";
import "./MoveProductModal.css";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import FormSelect from "../../../common/FormSearchSelect/FormSearchSelect";
import { imageUrl } from "../../../../helper/helper";
import { ImageNotFound } from "../../../../assets/icons";

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 6L18 18" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const moveSchema = z.object({
  store: z.string().min(1, "Please select a store"),
});

const MoveProductModal = ({ isOpen, onClose, product, stores = [], onMove, loading = false }) => {
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(moveSchema),
    defaultValues: { store: "" },
  });

  if (!isOpen || !product) return null;

  const onSubmit = (data) => {
    onMove?.(product.id, data.store);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const imgSrc = product?.mediaList?.[0]?.mediaId
    ? `${imageUrl}${product.mediaList[0].mediaId}`
    : ImageNotFound;

  return (
    <div className="move-product-overlay" onClick={handleOverlayClick}>
      <div className="move-product-modal">
        <div className="move-product-header">
          <h2 className="move-product-title">Move to</h2>
          <button className="move-product-close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="move-product-body">
            <div className="move-product-field">
              <label className="move-product-label">Store Name</label>
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

            <div className="move-product-field">
              <label className="move-product-label">Product</label>
              <div className="move-product-info">
                <div className="product-image">
                  <img src={imgSrc} alt={product?.productTitle_i18n?.en} />
                </div>
                <span className="move-product-name">
                  {product?.productTitle_i18n?.en || ""}
                </span>
              </div>
            </div>
          </div>

          <div className="move-product-footer">
            <button
              type="submit"
              className="move-product-btn-modal"
              disabled={loading}
            >
              {loading ? "Moving..." : "Move"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MoveProductModal;