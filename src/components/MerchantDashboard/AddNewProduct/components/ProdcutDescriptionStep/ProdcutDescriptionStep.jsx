import "./ProductDescriptionStep.css";
import { useEffect, useState } from "react";
import LanguageTabs from "../LanguageTabs/LanguageTabs";
import FormInput from "../../../../common/FormInput";
import FormSearchSelect from "../../../../common/FormSearchSelect/FormSearchSelect";
import FormCategorySelect from "../../../../common/FormCategorySelect/FormCategorySelect";
import FormTextArea from "../../../../common/FormTextArea";
import useSearchBrand from "../../../../../hooks/useSearchBrand";
import useSegments from "../../../../../hooks/useSegments";
import TagsInput from "../../../../common/TagsInput/TagsInput";
import FormRadioButtons from "../../../../common/FormRadioButtons/FormRadioButtons";
import useGeneral from "../../../../../hooks/useGeneral";

//  titleEn         title / title_i18n.en         REQUIRED
//  titleAr         title_i18n.ar                 optional
//  descriptionEn   description / description_i18n.en  optional
//  descriptionAr   description_i18n.ar           optional
//  brandId         brandId                       REQUIRED
//  taxId           taxId                         REQUIRED
//  comment         comment                       optional
//  productType     productType                   optional
//  categoryId      categoryId                    REQUIRED
//  segmentId       segmentId                     REQUIRED
//  tags            tags                          optional

const LANGUAGE_TABS = [
  { label: "English", value: "en" },
  { label: "Arabic", value: "ar" },
];

const ProductDescriptionStep = ({
  control,
  errors,
  setValue,
  watch,
  isEdit = false,
  setActiveTab,
  activeTab,
  
}) => {
  const { fetchAllBrands, allBrandList } = useSearchBrand();
  const { segmentsEnrich, fetchSegmentsEnrich } = useSegments();
  const { fetchTaxClasses, taxList } = useGeneral();

  const BRAND_OPTIONS = allBrandList.map((brand) => ({
    label: brand.brandName,
    value: brand.id,
  }));

  const TAX_CLASS_OPTIONS = taxList.map((tax) => ({
    label: tax.name_i18n?.en || tax.name,
    value: tax.id,
  }));

  useEffect(() => {
    fetchAllBrands();
    fetchSegmentsEnrich();
    fetchTaxClasses();
  }, []);

  
  return (
    <div className="pds-step-wrapper">
      <div className="pds-card pds-main-card">
        <div className="pds-main-card__inner">
          <div className="pds-product-info">
            <h2 className="pds-section-title">General information</h2>

            <LanguageTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              tabs={LANGUAGE_TABS}
            />

            {/* ── English tab ── */}
            {activeTab === "en" && (
              <div className="pds-tab-content">
                {/* titleEn → backend: title / title_i18n.en (REQUIRED) */}
                <FormInput
                  label={
                    <>
                      Product Name{" "}
                      <span className="pds-label-hint">(English)</span>
                    </>
                  }
                  name="titleEn"
                  placeholder="Product Name"
                  control={control}
                  error={errors.titleEn?.message}
                  variant="bordered"
                  required
                  styleLabel={{ marginBottom: "0px", fontSize: "16px" }}
                />

                {/* descriptionEn → backend: description / description_i18n.en (optional) */}
                <FormTextArea
                  name="descriptionEn"
                  control={control}
                  error={errors.descriptionEn?.message}
                  label={
                    <>
                      Description{" "}
                      <span className="pds-label-hint">(English)</span>
                    </>
                  }
                  placeholder="Description"
                />
              </div>
            )}

            {/* ── Arabic tab ── */}
            {activeTab === "ar" && (
              <div className="pds-tab-content">
                {/* titleAr → backend: title_i18n.ar (optional) */}
                <FormInput
                  label={
                    <>
                      Product Name{" "}
                      <span className="pds-label-hint">(Arabic)</span>
                    </>
                  }
                  name="titleAr"
                  placeholder="اسم المنتج"
                  control={control}
                  error={errors.titleAr?.message}
                  variant="bordered"
                  required
                  styleLabel={{ marginBottom: "0px", fontSize: "16px" }}
                />

                {/* descriptionAr → backend: description_i18n.ar (optional) */}
                <FormTextArea
                  name="descriptionAr"
                  control={control}
                  error={errors.descriptionAr?.message}
                  label={
                    <>
                      Description{" "}
                      <span className="pds-label-hint">(Arabic)</span>
                    </>
                  }
                  placeholder="وصف المنتج"
                />
              </div>
            )}

            {/* brandId → backend: brandId (REQUIRED) */}
            <FormSearchSelect
              label="Brand Name"
              name="brandId"
              options={BRAND_OPTIONS}
              placeholder="Brand"
              control={control}
              error={errors.brandId?.message}
              variant="bordered"
              bgColor="var(--color-white)"
              styleLabel={{ fontSize: "16px", marginBottom: "0px" }}
            />

            {/* taxId → backend: taxId (REQUIRED) */}
            <FormSearchSelect
              label="Tax Class"
              name="taxId"
              options={TAX_CLASS_OPTIONS}
              placeholder="Select Tax Class"
              control={control}
              error={errors.taxId?.message}
              variant="bordered"
              bgColor="var(--color-white)"
              styleLabel={{ fontSize: "16px", marginBottom: "0px" }}
            />

            {/* comment → backend: comment (optional) */}
            <FormInput
              label="Internal note (not shown to customers)"
              name="comment"
              placeholder="Add private notes..."
              control={control}
              error={errors.comment?.message}
              variant="bordered"
              styleLabel={{ fontSize: "16px", marginBottom: "0px" }}
            />
          </div>

          <div className="pds-vertical-divider" />

          <div className="pds-status-category">
            <div className="pds-status-header">
              <h2 className="pds-section-title">Classification</h2>
            </div>

            <div className="pds-status-fields">
              {/* productType → backend: productType (optional) */}
              <FormRadioButtons
                name="productType"
                label="Product Type"
                control={control}
                options={[
                  { label: "Physical", value: "physical" },
                  { label: "Digital", value: "digital" },
                  { label: "Service", value: "service" },
                ]}
                multiple={false}
              />

              {/* categoryId → backend: categoryId (REQUIRED) */}
              {/* segmentId → backend: segmentId (REQUIRED, auto-set via onSelect) */}
              <FormCategorySelect
                label="Category"
                name="categoryId"
                segments={segmentsEnrich}
                required
                placeholder="Select Product Category"
                control={control}
                error={errors.categoryId?.message}
                styleLabel={{ fontSize: "16px", marginBottom: "10px" }}
                onSelect={({ segmentId }) => setValue("segmentId", segmentId)}
              />
              {errors.segmentId && !errors.categoryId && (
                <span
                  style={{
                    color: "#ef4444",
                    fontSize: "12px",
                    marginTop: "-8px",
                  }}
                >
                  {errors.segmentId.message}
                </span>
              )}

              {/* tags → backend: tags (optional) */}
              <TagsInput
                name="tags"
                control={control}
                suggestions={[
                  "Dead Sea",
                  "Mud",
                  "Mineral",
                  "Natural",
                  "Organic",
                ]}
                error={errors.tags?.message}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDescriptionStep;
