import "./HeaderAddProduct.css";
import BackButton from "../../../../common/BackButton/BackButton";
import DraftButton from "../../../../common/DraftButton/DraftButton";
const HeaderAddProduct = ({ isEditMode }) => {
  return (
    <>
      <div className="header-add-product">
        <BackButton
          redirectTo={isEditMode ? "/merchant/dashboard/products" : "/merchant/dashboard/select-inventory"}
          label={isEditMode ? "Edit Product" : "Add Product"}
        >
          <div className="flex-center-row">
            <DraftButton textButton="Preview" />
            {!isEditMode && <DraftButton textButton="Save as Draft" />}
          </div>
        </BackButton>
      </div>
    </>
  );
};

export default HeaderAddProduct;
