import React, { useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { imageUrl } from "../../../../helper/helper";
import RatingFilter from "../../../../components/common/RatingFilter/RatingFilter";

const reviewSchema = z.object({
  rating: z
    .number()
    .min(1, "Please select a rating")
    .max(5, "Rating must be between 1 and 5")
    .nullable()
    .refine((val) => val !== null, {
      message: "Please select a rating",
    }),
  feedback: z
    .string()
    .min(1, "Feedback is required")
    .min(10, "Feedback must be at least 10 characters")
    .max(500, "Feedback must be less than 500 characters"),
});

const ReviewModal = ({
  item,
  currency,
  userId,
  onClose,
  reviewProductHandler,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: null,
      feedback: "",
    },
  });

  const onSubmit = useCallback(
    async (data) => {
      try {
        const reviewData = {
          userId,
          orderLineId: item?.skuId,
          rating: data.rating,
          body: data.feedback,
          status: "PUBLISHED",
        };

        await reviewProductHandler(reviewData);
        reset();
      } catch (error) {
        console.error("Review submission failed:", error);
      } finally {
        onClose();
      }
    },
    [userId, item, reviewProductHandler, onClose, reset]
  );

  const price =
    item.sku?.price?.JO?.salePrice || item.sku?.price?.JO?.listPrice;

  return (
    <div className="review-Modal">
      <div className="modalOverlay">
        <div className="modalContainer">
          <div className="modalHeader">
            <h2>Write a Review</h2>
          </div>

          <p>Tell us your feedback</p>

          <div className="productInfo">
            <img
              src={
                item.sku?.mediaList?.[0]?.mediaId
                  ? `${imageUrl}${item.sku.mediaList[0].mediaId}`
                  : "https://via.placeholder.com/100"
              }
              alt={item.sku?.productTitle || "Product"}
            />
            <div>
              <p className="productTitle">{item.sku?.productTitle}</p>
              {item.sku?.attributeValues?.length > 0 && (
                <p className="productMeta">
                  {item.sku.attributeValues
                    .map((attr) => `${attr.value}`)
                    .join(" • ")}
                </p>
              )}
              <p className="productMeta">Quantity: {item.quantity}x</p>
            </div>
            <span className="price">
              {currency} {price}
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="review-section">
              <div className="ratingSection">
                <p>Rate Item</p>
                <Controller
                  name="rating"
                  control={control}
                  render={({ field }) => (
                    <RatingFilter
                      selectedRating={field.value}
                      onRatingChange={field.onChange}
                    />
                  )}
                />
                {errors.rating && (
                  <span className="field-error">{errors.rating.message}</span>
                )}
              </div>

              <div className="feedbackSection">
                <p>Feedback</p>
                <Controller
                  name="feedback"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      placeholder="Share your experience with this product..."
                    />
                  )}
                />
                {errors.feedback && (
                  <span className="field-error">
                    {errors.feedback.message}
                  </span>
                )}
              </div>
            </div>

            <div className="modalActions">
              <button
                type="button"
                className="btnSecondary"
                disabled={isSubmitting}
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btnPrimary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Done"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;