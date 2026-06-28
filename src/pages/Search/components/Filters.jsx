import { MainLogo } from "../../../assets/icons";
import CloseIcon from "@mui/icons-material/Close";
import FILTER_ICON from "../../../assets/icons/SearchFilter.svg";
import ClearIcon from "@mui/icons-material/Clear";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import StarIcon from "@mui/icons-material/Star";
import FilterPrice from "../../../components/common/FilterPrice";
import { useCallback, useEffect, useRef, useState } from "react";
import { imageUrl } from "../../../helper/helper";
import { useSearchParams, useNavigate } from "react-router-dom";
import RatingFilter from "../../../components/common/RatingFilter/RatingFilter";

const SHOP_MODELS = ["All", "Retail", "Wholesale", "Gift"];

const COLORS = [
  "#16a34a",
  "#ef4444",
  "#facc15",
  "#f97316",
  "#06b6d4",
  "#2563eb",
  "#7c3aed",
  "#ec4899",
  "#e5e5e5",
  "#000000",
];

const SIZES = [
  "XX-Small",
  "X-Small",
  "Small",
  "Medium",
  "Large",
  "X-Large",
  "XX-Large",
  "3X-Large",
  "4X-Large",
];

const RATING_OPTIONS = [5, 4, 3, 2, 1];

const INITIAL_SECTIONS = {
  category: true,
  brand: true,
  price: true,
  colors: true,
  size: true,
  attributes: true,
  rating: true,
};

const SegmentItem = ({
  segment,
  expandedSegments,
  expandedCategories,
  selectedCategories,
  selectedSegments,
  onToggleSegment,
  onToggleCategory,
  onToggleSelectedCategory,
  onToggleSelectedSegment,
}) => {
  const isExpanded = expandedSegments[segment.id];
  const hasChildren = segment.children?.length > 0;
  const isSelected = selectedSegments.includes(segment.id);

  const handleClick = () => {
    onToggleSelectedSegment(segment.id);
    if (hasChildren) {
      onToggleSegment(segment.id);
    }
  };

  return (
    <div className="category-block">
      <div
        className={`filter-item ${isSelected ? "active" : ""}`}
        onClick={handleClick}
      >
        {segment.name_i18n?.en || segment.segmentName}
        <span className="category-arrow">
          {hasChildren &&
            (isExpanded ? <KeyboardArrowUpIcon /> : <ChevronRightIcon />)}
        </span>
      </div>

      {isExpanded && hasChildren && (
        <div className="subcategory-list">
          {segment.children.map((cat) => (
            <CategoryItem
              key={cat.id}
              category={cat}
              expandedCategories={expandedCategories}
              selectedCategories={selectedCategories}
              onToggleCategory={onToggleCategory}
              onToggleSelectedCategory={onToggleSelectedCategory}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CategoryItem = ({
  category,
  expandedCategories,
  selectedCategories,
  onToggleCategory,
  onToggleSelectedCategory,
}) => {
  const hasChildren = category.children?.length > 0;
  const isExpanded = expandedCategories[category.id];
  const isSelected = selectedCategories.includes(category.id);

  const handleClick = () => {
    onToggleSelectedCategory(category.id);
    if (hasChildren) {
      onToggleCategory(category.id);
    }
  };

  return (
    <div className="subcategory-block">
      <div
        className={`subcategory-item ${isSelected ? "active" : ""}`}
        onClick={handleClick}
      >
        {category.name_i18n?.en || category.categoryName}
        {hasChildren && (
          <span className="sub-arrow">
            {isExpanded ? (
              <KeyboardArrowUpIcon fontSize="small" />
            ) : (
              <ChevronRightIcon fontSize="small" />
            )}
          </span>
        )}
      </div>

      {isExpanded && hasChildren && (
        <div className="sub-subcategory-list">
          {category.children.map((sub) => (
            <div
              key={sub.id}
              className={`sub-subcategory-item ${
                selectedCategories.includes(sub.id) ? "active" : ""
              }`}
              onClick={() => onToggleSelectedCategory(sub.id)}
            >
              {sub.name_i18n?.en || sub.categoryName}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Filter = ({
  sidebarOpen,
  setSidebarOpen,
  searchFilters,
  onFilterChange,
  initialFilters,
}) => {
  const isInitialMount = useRef(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "");
  const [selectedShopModels, setSelectedShopModels] = useState(
    initialFilters?.shopModel?.length > 0 ? initialFilters.shopModel : ["All"],
  );
  const [selectedBrands, setSelectedBrands] = useState(
    initialFilters?.brandId || [],
  );
  const [selectedCategories, setSelectedCategories] = useState(
    initialFilters?.categoryId || [],
  );
  const [selectedAttributes, setSelectedAttributes] = useState(
    initialFilters?.attribute || [],
  );
  const [priceFrom, setPriceFrom] = useState(initialFilters?.priceFrom ?? null);
  const [priceTo, setPriceTo] = useState(initialFilters?.priceTo ?? null);
  const [selectedRating, setSelectedRating] = useState(
    initialFilters?.rating ?? null,
  );

  const [selectedSegments, setSelectedSegments] = useState(
    initialFilters?.segmentId ? [initialFilters.segmentId] : [],
  );
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  const [expandedSegments, setExpandedSegments] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});
  const [openSections, setOpenSections] = useState(INITIAL_SECTIONS);

  const {
    brands = [],
    attributes = [],
    categories = [],
    priceRange = {},
  } = searchFilters || {};

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const shopModelValues =
      selectedShopModels.includes("All") || selectedShopModels.length === 0
        ? undefined
        : selectedShopModels.map((m) => m.toLowerCase());

    onFilterChange({
      brandId: selectedBrands.length > 0 ? selectedBrands : undefined,
      categoryId:selectedCategories.length > 0 ? selectedCategories : undefined,
      categoryId: selectedSegments.length > 0 ? selectedSegments : undefined,
      attribute: selectedAttributes.length > 0 ? selectedAttributes : undefined,
      priceFrom: priceFrom ?? undefined,
      priceTo: priceTo ?? undefined,
      shopModel: shopModelValues,
      rating: selectedRating ?? undefined,
    });
  }, [
    selectedBrands,
    selectedCategories,
    selectedSegments,
    selectedAttributes,
    priceFrom,
    priceTo,
    selectedShopModels,
    selectedRating,
  ]);

  const toggleSection = useCallback((section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const toggleSegment = useCallback((segmentId) => {
    setExpandedSegments((prev) => ({
      ...prev,
      [segmentId]: !prev[segmentId],
    }));
  }, []);

  const toggleCategory = useCallback((categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  }, []);

  const handleShopModelChange = useCallback((model) => {
    if (model === "All") {
      setSelectedShopModels(["All"]);
      return;
    }
    setSelectedShopModels((prev) => {
      const filtered = prev.filter((m) => m !== "All");
      if (filtered.includes(model)) {
        const result = filtered.filter((m) => m !== model);
        return result.length === 0 ? ["All"] : result;
      }
      return [...filtered, model];
    });
  }, []);

  const handleBrandToggle = useCallback((brandId) => {
    setSelectedBrands((prev) =>
      prev.includes(brandId)
        ? prev.filter((id) => id !== brandId)
        : [...prev, brandId],
    );
  }, []);

  const handleToggleSelectedCategory = useCallback((categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  }, []);

  const handleAttributeToggle = useCallback((attrKey, attrValue) => {
    const attrString = `${attrKey}:${attrValue}`;
    setSelectedAttributes((prev) =>
      prev.includes(attrString)
        ? prev.filter((a) => a !== attrString)
        : [...prev, attrString],
    );
  }, []);

  const handleRatingChange = useCallback((rating) => {
    setSelectedRating((prev) => (prev === rating ? null : rating));
  }, []);

  const handlePriceChange = useCallback((from, to) => {
    setPriceFrom(from);
    setPriceTo(to);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchValue("");
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, [setSidebarOpen]);

  const handleToggleSelectedSegment = useCallback((segmentId) => {
    setSelectedSegments((prev) =>
      prev.includes(segmentId)
        ? prev.filter((id) => id !== segmentId)
        : [...prev, segmentId],
    );
  }, []);
  return (
    <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
      <div className="modal-logo">
        <MainLogo className="main-modal-logo" />
        <button className="close-btn" onClick={handleCloseSidebar}>
          <CloseIcon style={{ color: "#151515" }} />
        </button>
      </div>

      <div className="wrapper">
        <img className="icon" src={FILTER_ICON} alt="filter" />
        <input
          type="text"
          placeholder="What are you looking for?"
          className="input"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && searchValue.trim()) {
              const params = new URLSearchParams(searchParams);
              params.set("q", searchValue.trim());
              navigate(`/search?${params.toString()}`);
            }
          }}
        />
        {searchValue && (
          <ClearIcon className="clear-icon" onClick={handleClearSearch} />
        )}
      </div>

      <div className="sidebar-scroll-content">
        {/* <div className="section">
          <div className="section-title">Shop Model</div>
          <div className="shop-model-list">
            {SHOP_MODELS.map((model) => (
              <label key={model} className="shop-model-item">
                <input
                  type="checkbox"
                  checked={selectedShopModels.includes(model)}
                  onChange={() => handleShopModelChange(model)}
                  className="shop-model-checkbox"
                />
                <span>{model}</span>
              </label>
            ))}
          </div>
        </div> */}

        {brands.length > 0 && (
          <div className="section">
            <div
              className="section-title price-header"
              onClick={() => toggleSection("brand")}
            >
              Brand
              <span className="arrow">
                {openSections.brand ? (
                  <KeyboardArrowUpIcon />
                ) : (
                  <KeyboardArrowDownIcon />
                )}
              </span>
            </div>
            {openSections.brand && (
              <div className="brand-filter-list">
                {brands.map((brand) => (
                  <label key={brand.id} className="brand-filter-item">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand.id)}
                      onChange={() => handleBrandToggle(brand.id)}
                      className="shop-model-checkbox"
                    />
                    <span className="brand-filter-label">
                      {brand.logoId && (
                        <img
                          src={`${imageUrl}${brand.logoId}`}
                          alt={brand.brandName}
                          className="brand-filter-logo"
                        />
                      )}
                      {brand.brandName}
                      {/* {brand.ratingCount > 0 && (
                        <span className="brand-filter-count">
                          ({brand.ratingCount})
                        </span>
                      )} */}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="section">
          <div
            className="section-title price-header"
            onClick={() => toggleSection("category")}
          >
            Category
            <span className="arrow">
              {openSections.category ? (
                <KeyboardArrowUpIcon />
              ) : (
                <KeyboardArrowDownIcon />
              )}
            </span>
          </div>
          {openSections.category &&
            categories?.map((segment, index) => (
              <SegmentItem
                key={`${segment.id}-${index}`}
                segment={segment}
                expandedSegments={expandedSegments}
                expandedCategories={expandedCategories}
                selectedCategories={selectedCategories}
                selectedSegments={selectedSegments}
                onToggleSegment={toggleSegment}
                onToggleCategory={toggleCategory}
                onToggleSelectedCategory={handleToggleSelectedCategory}
                onToggleSelectedSegment={handleToggleSelectedSegment}
              />
            ))}
        </div>

        {attributes.length > 0 && (
          <div className="section">
            <div
              className="section-title price-header"
              onClick={() => toggleSection("attributes")}
            >
              Attributes
              <span className="arrow">
                {openSections.attributes ? (
                  <KeyboardArrowUpIcon />
                ) : (
                  <KeyboardArrowDownIcon />
                )}
              </span>
            </div>
            {openSections.attributes &&
              attributes.map((attr) => (
                <div key={attr.key} className="attribute-group">
                  <div className="attribute-group-title">
                    {attr.label_i18n?.en || attr.key}
                  </div>
                  <div className="attribute-values">
                    {attr.values.map((val) => {
                      const attrString = `${attr.key}:${val.valueKey}`;
                      return (
                        <label
                          key={val.valueKey}
                          className="attribute-value-item"
                        >
                          <input
                            type="checkbox"
                            checked={selectedAttributes.includes(attrString)}
                            onChange={() =>
                              handleAttributeToggle(attr.key, val.valueKey)
                            }
                            className="shop-model-checkbox"
                          />
                          <span>{val.value_i18n?.en || val.valueKey}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        )}

        <div className="section">
          <div
            className="section-title price-header"
            onClick={() => toggleSection("price")}
          >
            Price
            {priceRange.minPrice !== undefined && (
              <span className="price-range-hint">
                {priceRange.minPrice} - {priceRange.maxPrice}
              </span>
            )}
            <span className="arrow">
              {openSections.price ? (
                <KeyboardArrowUpIcon />
              ) : (
                <KeyboardArrowDownIcon />
              )}
            </span>
          </div>
          {openSections.price && (
            <FilterPrice
              min={priceRange.minPrice}
              max={priceRange.maxPrice}
              onPriceChange={handlePriceChange}
            />
          )}
        </div>

        <div className="section">
          <div
            className="section-title price-header"
            onClick={() => toggleSection("rating")}
          >
            Rating
            <span className="arrow">
              {openSections.rating ? (
                <KeyboardArrowUpIcon />
              ) : (
                <KeyboardArrowDownIcon />
              )}
            </span>
          </div>
          {openSections.rating && (
            <RatingFilter
              selectedRating={selectedRating}
              onRatingChange={(rating) => setSelectedRating(rating)}
            />
          )}
        </div>

        {/* <div className="section">
          <div
            className="section-title price-header"
            onClick={() => toggleSection("colors")}
          >
            Colors
            <span className="arrow">
              {openSections.colors ? (
                <KeyboardArrowUpIcon />
              ) : (
                <KeyboardArrowDownIcon />
              )}
            </span>
          </div>
          {openSections.colors && (
            <div className="colors">
              {COLORS.map((color) => (
                <div
                  key={color}
                  className={`color-circle ${selectedColor === color ? "active" : ""}`}
                  style={{ background: color }}
                  onClick={() => setSelectedColor(color)}
                >
                  {selectedColor === color && <span>✓</span>}
                </div>
              ))}
            </div>
          )}
        </div> */}

        {/* <div className="section">
          <div
            className="section-title price-header"
            onClick={() => toggleSection("size")}
          >
            Size
            <span className="arrow">
              {openSections.size ? (
                <KeyboardArrowUpIcon />
              ) : (
                <KeyboardArrowDownIcon />
              )}
            </span>
          </div>
          {openSections.size && (
            <div className="sizes">
              {SIZES.map((size) => (
                <button
                  key={size}
                  className={`size-btn ${selectedSize === size ? "active" : ""}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          )}
        </div> */}
      </div>
    </aside>
  );
};

export default Filter;
