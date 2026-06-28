import CloseIcon from "@mui/icons-material/Close";
import FILTER_ICON from "../../../assets/icons/SearchFilter.svg";
import ClearIcon from "@mui/icons-material/Clear";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import FilterPrice from "../../../components/common/FilterPrice";
import { useState, useCallback, useEffect, useRef } from "react";
import { MainLogoDark } from "../../../assets/icons";
import { useSearchParams, useNavigate } from "react-router-dom";
import RatingFilter from "../../../components/common/RatingFilter/RatingFilter";

const INITIAL_VISIBLE_COUNT = 4;

const dedupeById = (arr) =>
  arr.filter(
    (item, idx, self) => self.findIndex((c) => c.id === item.id) === idx,
  );

const CategoryTree = ({
  nodes,
  selectedCategories,
  onCategoryChange,
  expandedNodes,
  onToggleNode,
  depth = 0,
}) => {
  const uniqueNodes = dedupeById(nodes);

  return (
    <div className="brand-category-tree">
      {uniqueNodes.map((node) => {
        const hasChildren =
          node.children && node.children.length > 0 && !node.isLeaf;
        const isExpanded = expandedNodes[node.id] !== false;
        const uniqueChildren = hasChildren ? dedupeById(node.children) : [];

        return (
          <div key={node.id} className="brand-category-node">
            {hasChildren ? (
              <>
                <div
                  className={`brand-category-parent brand-category-depth-${depth}`}
                  onClick={() => onToggleNode(node.id)}
                >
                  <span className="brand-category-toggle-icon">
                    {isExpanded ? (
                      <KeyboardArrowDownIcon fontSize="small" />
                    ) : (
                      <ChevronRightIcon fontSize="small" />
                    )}
                  </span>
                  <span className="brand-category-parent-label">
                    {node.name_i18n?.en ||
                      node.categoryName ||
                      node.segmentName}
                  </span>
                </div>
                {isExpanded && (
                  <div className="brand-category-children">
                    <CategoryTree
                      nodes={uniqueChildren}
                      selectedCategories={selectedCategories}
                      onCategoryChange={onCategoryChange}
                      expandedNodes={expandedNodes}
                      onToggleNode={onToggleNode}
                      depth={depth + 1}
                    />
                  </div>
                )}
              </>
            ) : (
              <label
                className={`brand-shop-model-item brand-category-leaf brand-category-depth-${depth}`}
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(node.id)}
                  onChange={() => onCategoryChange(node.id)}
                  className="brand-shop-model-checkbox"
                />
                <span>
                  {node.name_i18n?.en || node.categoryName || node.segmentName}
                </span>
              </label>
            )}
          </div>
        );
      })}
    </div>
  );
};

const BrandFilter = ({
  brandFilterOpen,
  setBrandFilterOpen,
  initialFilters = {},
  onFilterChange,
  searchFilters = {},
}) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isInitialMount = useRef(true);

  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "");
  const [selectedBrands, setSelectedBrands] = useState(
    initialFilters.brandId || [],
  );
  const [selectedAttributes, setSelectedAttributes] = useState(
    initialFilters.attribute || [],
  );
  const [selectedCategories, setSelectedCategories] = useState(
    initialFilters.categoryId || [],
  );
  const [selectedRating, setSelectedRating] = useState(
    initialFilters.rating || null,
  );
  const [priceFrom, setPriceFrom] = useState(initialFilters.priceFrom);
  const [priceTo, setPriceTo] = useState(initialFilters.priceTo);

  const [showAllBrands, setShowAllBrands] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [expandedAttributes, setExpandedAttributes] = useState({});
  const [expandedCategoryNodes, setExpandedCategoryNodes] = useState({});

  const [openSections, setOpenSections] = useState({
    brand: true,
    category: true,
    price: true,
    customerReview: true,
  });

  const brands = searchFilters.brands || [];
  const attributes = searchFilters.attributes || [];
  const categories = searchFilters.categories || [];
  const priceRange = searchFilters.priceRange || {
    minPrice: 0,
    maxPrice: 2000,
  };

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleCategoryNode = (nodeId) => {
    setExpandedCategoryNodes((prev) => ({
      ...prev,
      [nodeId]: prev[nodeId] === false ? true : false,
    }));
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    onFilterChange?.({
      brandId: selectedBrands.length > 0 ? selectedBrands : undefined,
      categoryId:
        selectedCategories.length > 0 ? selectedCategories : undefined,
      attribute: selectedAttributes.length > 0 ? selectedAttributes : undefined,
      rating: selectedRating ?? undefined,
      priceFrom: priceFrom ?? undefined,
      priceTo: priceTo ?? undefined,
    });
  }, [
    selectedBrands,
    selectedCategories,
    selectedAttributes,
    selectedRating,
    priceFrom,
    priceTo,
  ]);

  const handleBrandChange = (brandId) => {
    setSelectedBrands((prev) =>
      prev.includes(brandId)
        ? prev.filter((id) => id !== brandId)
        : [...prev, brandId],
    );
  };

  const handleAttributeChange = (label, value) => {
    const attrString = `${label}:${value}`;
    setSelectedAttributes((prev) =>
      prev.includes(attrString)
        ? prev.filter((a) => a !== attrString)
        : [...prev, attrString],
    );
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const handleRatingClick = (rating) => {
    setSelectedRating((prev) => (prev === rating ? null : rating));
  };

  const handlePriceChange = (min, max) => {
    setPriceFrom(min);
    setPriceTo(max);
  };

  const toggleAttributeExpand = (label) => {
    setExpandedAttributes((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const filteredBrands = brands;

  const visibleBrands = showAllBrands
    ? filteredBrands
    : filteredBrands.slice(0, INITIAL_VISIBLE_COUNT);

  const uniqueCategories = dedupeById(categories);

  const visibleCategories = showAllCategories
    ? uniqueCategories
    : uniqueCategories.slice(0, INITIAL_VISIBLE_COUNT);

  return (
    <aside
      className={`brand-sidebar ${brandFilterOpen ? "brand-open" : "brand-closed"}`}
    >
      <div className="brand-modal-logo">
        <MainLogoDark className="brand-main-modal-logo" />
        <button
          className="brand-close-btn"
          onClick={() => setBrandFilterOpen(false)}
        >
          <CloseIcon />
        </button>
      </div>
      <div className="brand-wrapper">
        <img className="brand-icon" src={FILTER_ICON} />
        <input
          type="text"
          placeholder="What are you looking for?"
          className="brand-input"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && searchValue.trim()) {
              const params = new URLSearchParams(searchParams);
              params.set("q", searchValue.trim());
              navigate(`/search-brand?${params.toString()}`);
            }
          }}
        />
        {searchValue && (
          <ClearIcon
            className="clear-icon"
            style={{
              color: "var(--color-white)",
            }}
            onClick={() => setSearchValue("")}
          />
        )}
      </div>
      <div className="brand-sidebar-scroll-content">
        {/* ── Brand Section ── */}
        <div className="brand-section">
          <div
            className="brand-section-title brand-price-header"
            onClick={() => toggleSection("brand")}
          >
            Brand
            <span className="brand-arrow">
              {openSections.brand ? (
                <KeyboardArrowUpIcon />
              ) : (
                <KeyboardArrowDownIcon />
              )}
            </span>
          </div>
          {openSections.brand && (
            <>
              <div className="brand-shop-model-list">
                {visibleBrands.map((brand) => (
                  <label key={brand.id} className="brand-shop-model-item">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand.id)}
                      onChange={() => handleBrandChange(brand.id)}
                      className="brand-shop-model-checkbox"
                    />
                    <span>{brand.brandName}</span>
                  </label>
                ))}
              </div>
              {filteredBrands.length > INITIAL_VISIBLE_COUNT && (
                <button
                  className="brand-see-more-btn"
                  onClick={() => setShowAllBrands((prev) => !prev)}
                >
                  {showAllBrands ? "See Less" : "See More"}{" "}
                  {showAllBrands ? (
                    <KeyboardArrowUpIcon fontSize="small" />
                  ) : (
                    <KeyboardArrowDownIcon fontSize="small" />
                  )}
                </button>
              )}
            </>
          )}
        </div>

        {/* ── Category Section ── */}
        {uniqueCategories.length > 0 && (
          <div className="brand-section">
            <div
              className="brand-section-title brand-price-header"
              onClick={() => toggleSection("category")}
            >
              Category
              <span className="brand-arrow">
                {openSections.category ? (
                  <KeyboardArrowUpIcon />
                ) : (
                  <KeyboardArrowDownIcon />
                )}
              </span>
            </div>
            {openSections.category && (
              <>
                <div className="brand-category-tree-wrapper">
                  {visibleCategories.map((segment) => {
                    const segmentHasChildren =
                      segment.children && segment.children.length > 0;
                    const isSegmentExpanded =
                      expandedCategoryNodes[segment.id] !== false;

                    return (
                      <div key={segment.id} className="brand-category-segment">
                        <div
                          className="brand-category-segment-header"
                          onClick={() =>
                            segmentHasChildren && toggleCategoryNode(segment.id)
                          }
                        >
                          {segmentHasChildren && (
                            <span className="brand-category-toggle-icon">
                              {isSegmentExpanded ? (
                                <KeyboardArrowDownIcon fontSize="small" />
                              ) : (
                                <ChevronRightIcon fontSize="small" />
                              )}
                            </span>
                          )}
                          <span className="brand-category-segment-title">
                            {segment.name_i18n?.en || segment.segmentName}
                          </span>
                        </div>

                        {segmentHasChildren && isSegmentExpanded && (
                          <div className="brand-category-children">
                            <CategoryTree
                              nodes={segment.children}
                              selectedCategories={selectedCategories}
                              onCategoryChange={handleCategoryChange}
                              expandedNodes={expandedCategoryNodes}
                              onToggleNode={toggleCategoryNode}
                              depth={1}
                            />
                          </div>
                        )}

                        {!segmentHasChildren && (
                          <label className="brand-shop-model-item brand-category-leaf brand-category-depth-0">
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(segment.id)}
                              onChange={() => handleCategoryChange(segment.id)}
                              className="brand-shop-model-checkbox"
                            />
                            <span>
                              {segment.name_i18n?.en || segment.segmentName}
                            </span>
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
                {uniqueCategories.length > INITIAL_VISIBLE_COUNT && (
                  <button
                    className="brand-see-more-btn"
                    onClick={() => setShowAllCategories((prev) => !prev)}
                  >
                    {showAllCategories ? "See Less" : "See More"}{" "}
                    {showAllCategories ? (
                      <KeyboardArrowUpIcon fontSize="small" />
                    ) : (
                      <KeyboardArrowDownIcon fontSize="small" />
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {attributes.map((attr) => {
          const attrKey = attr.key;
          const attrDisplayName = attr.label_i18n?.en || attrKey;
          const isExpanded = expandedAttributes[attrKey] !== false;
          const values = attr.values || [];

          return (
            <div className="brand-section" key={attrKey}>
              <div
                className="brand-section-title brand-price-header"
                onClick={() => toggleAttributeExpand(attrKey)}
              >
                {attrDisplayName}
                <span className="brand-arrow">
                  {isExpanded ? (
                    <KeyboardArrowUpIcon />
                  ) : (
                    <KeyboardArrowDownIcon />
                  )}
                </span>
              </div>
              {isExpanded && (
                <div className="brand-shop-model-list">
                  {values.map((val) => {
                    const attrString = `${attrKey}:${val.valueKey}`;
                    return (
                      <label
                        key={val.valueKey}
                        className="brand-shop-model-item"
                      >
                        <input
                          type="checkbox"
                          checked={selectedAttributes.includes(attrString)}
                          onChange={() =>
                            handleAttributeChange(attrKey, val.valueKey)
                          }
                          className="brand-shop-model-checkbox"
                        />
                        <span>{val.value_i18n?.en || val.valueKey}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* ── Customer Review Section ── */}

        <div className="brand-section">
          <div
            className="brand-section-title brand-price-header"
            onClick={() => toggleSection("customerReview")}
          >
            Customer Review
            <span className="brand-arrow">
              {openSections.customerReview ? (
                <KeyboardArrowUpIcon />
              ) : (
                <KeyboardArrowDownIcon />
              )}
            </span>
          </div>
          {openSections.customerReview && (
            <RatingFilter
              selectedRating={selectedRating}
              onRatingChange={setSelectedRating}
            />
          )}
        </div>

        {/* ── Price Section ── */}
        <div className="brand-section">
          <div
            className="brand-section-title brand-price-header"
            onClick={() => toggleSection("price")}
          >
            Price
            <span className="brand-arrow">
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
      </div>
    </aside>
  );
};

export default BrandFilter;
