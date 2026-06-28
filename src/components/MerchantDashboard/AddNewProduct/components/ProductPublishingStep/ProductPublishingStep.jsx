import "./ProductPublishingStep.css";
import { useFieldArray } from "react-hook-form";
import { Trash2, Plus } from "lucide-react";
import FormInput from "../../../../common/FormInput";
import FormTextArea from "../../../../common/FormTextArea";


//  metaTitleEn         metaTitle / metaTitle_i18n.en
//  metaTitleAr         metaTitle_i18n.ar
//  metaDescriptionEn   metaDescription / metaDescription_i18n.en
//  metaDescriptionAr   metaDescription_i18n.ar
//  sections[].titleEn    productSectionList[].title / title_i18n.en
//  sections[].titleAr    productSectionList[].title_i18n.ar
//  sections[].contentEn  productSectionList[].description / description_i18n.en
//  sections[].contentAr  productSectionList[].description_i18n.ar

const ProductPublishingStep = ({
  control,
  errors,
  isEdit = false,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "sections",
  });

  const handleAddSection = () => {
    append({ titleEn: "", titleAr: "", contentEn: "", contentAr: "" });
  };

  if (!control) {
    return <div>Marketing tab — no form control.</div>;
  }

  return (
    <div className="pps-wrapper">
      {/* ── SEO OPTIMIZATION ── */}
      <div className="pps-card">
        <h2 className="pps-card-title">SEO optimization</h2>
        <div className="pps-card-divider" />

        <div className="pps-row-2col">
          <FormInput
            label={
              <>
                Meta title <span className="pps-label-hint">(EN)</span>
              </>
            }
            name="metaTitleEn"
            placeholder="SEO Title..."
            control={control}
            error={errors?.metaTitleEn?.message}
            variant="bordered"
            styleLabel={{
              marginBottom: "0px",
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "0.04em",
            }}
          />
          <FormInput
            label={
              <>
                Meta title <span className="pps-label-hint">(AR)</span>
              </>
            }
            name="metaTitleAr"
            placeholder="عنوان SEO..."
            control={control}
            error={errors?.metaTitleAr?.message}
            variant="bordered"
            style={{ direction: "rtl", textAlign: "right" }}
            styleLabel={{
              marginBottom: "0px",
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "0.04em",
              textAlign: "right",
              display: "block",
            }}
          />
        </div>

        <div className="pps-row-2col">
          <FormTextArea
            label={
              <>
                Meta description <span className="pps-label-hint">(EN)</span>
              </>
            }
            name="metaDescriptionEn"
            placeholder="SEO Description..."
            control={control}
            error={errors?.metaDescriptionEn?.message}
            rows={3}
            className="pps-textarea-group"
          />
          <FormTextArea
            label={
              <>
                Meta description <span className="pps-label-hint">(AR)</span>
              </>
            }
            name="metaDescriptionAr"
            placeholder="وصف SEO..."
            control={control}
            error={errors?.metaDescriptionAr?.message}
            rows={3}
            className="pps-textarea-group pps-textarea-group--rtl"
          />
        </div>
      </div>

      {/* ── PRODUCT SECTIONS ── */}
      <div className="pps-section">
        <h2 className="pps-section-title">Product sections</h2>
        <div className="pps-section-divider" />

        {fields.map((field, index) => (
          <div key={field.id} className="pps-card pps-section-card">
            <div className="pps-row-2col pps-row-2col--with-delete">
              <FormInput
                label={
                  <>
                    Section title <span className="pps-label-hint">(EN)</span>
                  </>
                }
                name={`sections.${index}.titleEn`}
                placeholder="Section title..."
                control={control}
                error={errors?.sections?.[index]?.titleEn?.message}
                variant="bordered"
                styleLabel={{
                  marginBottom: "0px",
                  fontSize: "12px",
                  fontWeight: "700",
                  letterSpacing: "0.04em",
                }}
              />
              <div className="pps-input-with-delete">
                <FormInput
                  label={
                    <>
                      Section title{" "}
                      <span className="pps-label-hint">(AR)</span>
                    </>
                  }
                  name={`sections.${index}.titleAr`}
                  placeholder="عنوان القسم..."
                  control={control}
                  error={errors?.sections?.[index]?.titleAr?.message}
                  variant="bordered"
                  style={{ direction: "rtl", textAlign: "right" }}
                  styleLabel={{
                    marginBottom: "0px",
                    fontSize: "12px",
                    fontWeight: "700",
                    letterSpacing: "0.04em",
                    textAlign: "right",
                    display: "block",
                  }}
                />
                <button
                  type="button"
                  className="pps-delete-section-btn"
                  onClick={() => remove(index)}
                  title="Remove section"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            <div className="pps-row-2col">
              <FormTextArea
                label={
                  <>
                    Content <span className="pps-label-hint">(EN)</span>
                  </>
                }
                name={`sections.${index}.contentEn`}
                placeholder="Section content..."
                control={control}
                error={errors?.sections?.[index]?.contentEn?.message}
                rows={3}
                className="pps-textarea-group"
              />
              <FormTextArea
                label={
                  <>
                    Content <span className="pps-label-hint">(AR)</span>
                  </>
                }
                name={`sections.${index}.contentAr`}
                placeholder="محتوى القسم..."
                control={control}
                error={errors?.sections?.[index]?.contentAr?.message}
                rows={3}
                className="pps-textarea-group pps-textarea-group--rtl"
              />
            </div>
          </div>
        ))}

        {fields.length > 0 && (
          <div className="pps-template-hint">
            <span className="pps-template-hint-text">
              <em>Dynamic section template added.</em>
            </span>
          </div>
        )}

        <button
          type="button"
          className="pps-add-section-btn"
          onClick={handleAddSection}
        >
          <Plus size={16} />
          Add product section
        </button>
      </div>
    </div>
  );
};

export default ProductPublishingStep;