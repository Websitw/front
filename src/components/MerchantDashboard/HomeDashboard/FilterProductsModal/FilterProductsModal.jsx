import { useEffect, useState } from "react";
import FormSelect from "../../../common/FormSearchSelect/FormSearchSelect";
import Radioinput from "../../../common/Radioinput";
import CheckboxInput from "../../../common/CheckboxInput/CheckboxInput";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import "./FilterProductsModal.css";
import useInventory from "../../../../hooks/useInventory";
import useSearchBrand from "../../../../hooks/useSearchBrand";
import useSearch from "../../../../hooks/useSearch";
import useSegments from "../../../../hooks/useSegments";
import FormCategorySelect from "../../../common/FormCategorySelect/FormCategorySelect";

const CloseIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18 6L6 18M6 6L18 18"
      stroke="#1F2937"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function FilterProductsModal({ isOpen, setIsOpen }) {
  const { fetchAllInventories, inventories } = useInventory();
  const { allBrandList, fetchAllBrands } = useSearchBrand();
  const { allCategories, getGenralGategoriesHandler } = useSearch();
  const { segmentsEnrich, fetchSegmentsEnrich } = useSegments();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(
      z.object({
        category: z.string().min(1, "Category is required"),
        brand: z.string().min(1, "Brand is required"),
        storeName: z.string().optional(),
        productStatus: z.string().optional(),
        inventory: z.string().optional(),
        inventoryTracker: z.string().optional(),
        salesMethod: z.array(z.string()).optional(),
      })
    ),
    defaultValues: {
      category: "",
      brand: "",
      storeName: "",
      productStatus: "",
      inventory: "",
      inventoryTracker: "",
      salesMethod: [],
    },
  });

  const [filters, setFilters] = useState({
    category: "",
    brand: "",
    storeName: "",
    productStatus: "",
    inventory: "",
    inventoryTracker: "",
    salesMethod: [],
  });

  useEffect(() => {
    if (isOpen) {
      fetchAllInventories();
      fetchAllBrands();
      fetchSegmentsEnrich();
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (field) => (val) => {
    const value = val?.target ? val.target.value : val;
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    console.log("Filter applied:", filters);
  };

  const inventoryOptions = inventories.map((inv) => ({
    value: inv?.id,
    label: inv?.storeName || inv?.name || "Unnamed Store",
  }));

  const brandOptions = allBrandList.map((brand) => ({
    value: brand?.id,
    label: brand?.brandName || "Unnamed Brand",
  }));

  return (
    <div className="filter-modal-overlay" onClick={() => setIsOpen(false)}>
      <div
        className="filter-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="filter-modal-header">
          <h2 className="filter-modal-title">Filter your products</h2>
          <button
            className="filter-modal-close"
            onClick={() => setIsOpen(false)}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="filter-modal-body">
          <FormCategorySelect
            label="Category"
            name="category"
            segments={segmentsEnrich}
            required
            placeholder="Select Product Category"
            control={control}
            error={errors.category?.message}
          />
          <FormSelect
            label="Brand"
            placeholder="Brand Name"
            error={errors.brand?.message}
            variant="bordered"
            bgColor="var(--color-white)"
            style={{
              padding: "11px 20px",
            }}
            styleLabel={{
              marginBottom: "0px",
              fontSize: "16px",
              fontWeight: "400",
              color: "#151515",
            }}
            control={control}
            name="brand"
            options={brandOptions}
          />

          <FormSelect
            name="storeName"
            control={control}
            variant="bordered"
            bgColor="var(--color-white)"
            style={{
              padding: "11px 20px",
            }}
            styleLabel={{
              marginBottom: "0px",
              fontSize: "16px",
              fontWeight: "400",
              color: "#151515",
            }}
            label="Store Name"
            placeholder="Store Name"
            value={filters.storeName}
            onChange={handleChange("storeName")}
            options={inventoryOptions}
          />
          <CheckboxInput
            control={control}
            name="productStatus"
            label="Product Status"
            error={errors.productStatus?.message}
            options={[
              { value: "all", label: "All" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
              { value: "DRAFT", label: "Draft" },
              { value: "REVIEW", label: "Under Review" },
              { value: "REJECTED", label: "Rejected" },
            ]}
          />
          <Radioinput
            control={control}
            style={{
              marginBottom: "0",
              marginTop: "0",
            }}
            styleRadioOption={{
              border: "none",
              padding: "0px",
              fontWight: "400",
              height: "auto",
            }}
            styleRadioOptions={{
              gap: "10px",
            }}
            styleRadio={{
              width: "14px",
              height: "14px",
              color: "#818181",
            }}
            labelStyle={{
              fontSize: "16px",
              color: "#151515",
              fontWight: "400",
            }}
            styleSpan={{
              fontSize: "16px",
              color: "#818181",
              fontWight: "400",
            }}
            name="inventory"
            label="Inventory"
            error={errors.inventory?.message}
            options={[
              { value: "all", label: "All" },
              { value: "in_stock", label: "In stock" },
              { value: "out_of_stock", label: "Out of stock" },
            ]}
          />
          <Radioinput
            control={control}
            style={{
              marginBottom: "0",
              marginTop: "0",
            }}
            styleRadioOption={{
              border: "none",
              padding: "0px",
              height: "auto",
              fontWight: "400",
            }}
            styleRadioOptions={{
              gap: "10px",
            }}
            styleRadio={{
              width: "14px",
              height: "14px",
              color: "#818181",
            }}
            labelStyle={{
              fontSize: "16px",
              color: "#151515",
              fontWight: "400",
            }}
            styleSpan={{
              fontSize: "16px",
              color: "#818181",
              fontWight: "400",
            }}
            name="inventoryTracker"
            label="Inventory Tracker"
            error={errors.inventoryTracker?.message}
            options={[
              { value: "all", label: "All" },
              { value: "by_you", label: "By you" },
              { value: "by_sawa", label: "By Sawa" },
            ]}
          />

          <CheckboxInput
            control={control}
            name="salesMethod"
            label="Product sales method"
            error={errors.salesMethod?.message}
            options={[
              { value: "All", label: "All" },
              { value: "Retail", label: "Retail" },
              { value: "Have Discounts", label: "Have Discounts" },
              { value: "Pre order", label: "Pre order" },
              { value: "Gift Product", label: "Gift Product" },
              { value: "Wholesale", label: "Wholesale" },
            ]}
          />
        </div>

        <div className="filter-modal-footer">
          <button className="filter-search-btn" onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>
    </div>
  );
}