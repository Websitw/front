import "./ProductSidebar.css";
import SwitchInput from "../../../../common/SwitchInput/SwitchInput";


//  returnable          → returnable
//  isCouponApplicable  → isCouponApplicable
//  allowBackOrder      → allowBackOrder

const ProductSidebar = ({ control }) => {
  return (
    <div className="product-sidebar">
      <div className="product-sidebar__card">
        <h2 className="product-sidebar__title">Readiness</h2>

        <div className="pds-readiness">
          <span>✔ System Operational</span>
        </div>

        <div className="product-sidebar__divider" />

        <h2 className="product-sidebar__title">Policies</h2>
        <SwitchInput
          name="returnable"
          control={control}
          label="Returnable"
          gap="12px"
        />
        <SwitchInput
          name="isCouponApplicable"
          control={control}
          label="Coupon Applicable"
          gap="12px"
        />
        <SwitchInput
          name="allowBackOrder"
          control={control}
          label="Allow Back Order"
          gap="12px"
        />
      </div>
    </div>
  );
};

export default ProductSidebar;