import React, { useEffect, useState } from "react";
import {
  GreenSearch as Search,
  Filter,
  Trash as Trash2,
  AddButton as Plus,
  Discount,
  Import,
  Dotes,
  ImageNotFound,
} from "../../../assets/icons";
import Soothing from "../../../assets/icons/Soothing.svg";
import FilterProductsModal from "./FilterProductsModal/FilterProductsModal";
import RowActionsDropdown from "./RowActionsDropdown/RowActionsDropdown";
import MoveProductModal from "./MoveProductModal/MoveProductModal";
import MoveMultipleProductsModal from "./MoveMultipleProductsModal/MoveMultipleProductsModal";
import ImportProductsModal from "../../common/ImportProductsModal/ImportProductsModal";
import ConfirmDialog from "../../Admin/Modal/Modal";
import { showToast } from "../../CustomToast/CustomToast";
import "./HomeDashboard.css";
import { useNavigate } from "react-router-dom";
import userMerchant from "../../../hooks/useMerchant";
import useLocalStorage from "../../../hooks/useLocalStorage";
import { imageUrl } from "../../../helper/helper";
import useInventory from "../../../hooks/useInventory";
import useAddProduct from "../../../hooks/useAddProduct";

const tabs = [
  { id: "all", label: "All Products" },
  { id: "retail", label: "Retail products" },
  { id: "wholesale", label: "Wholesale products" },
  { id: "gift", label: "Gift Product" },
  { id: "preorder", label: "Pre order" },
  { id: "discounts", label: "Discounts" },
];

const storeFilters = [
  { id: "all", label: "All Stores", count: 20 },
  { id: "standard", label: "Standard Store", count: 20 },
  { id: "merchant", label: "Merchant Store", count: 20 },
];

const ProductsManagement = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [activeStore, setActiveStore] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [moveModalProduct, setMoveModalProduct] = useState(null);
  const [isMoveMultiOpen, setIsMoveMultiOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    productId: null,
    isMultiple: false,
  });
  const navgation = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userData] = useLocalStorage("userData", null);
  const merchantId = userData?.cbCusId;
  const { fetchMerchantProducts, merchantProducts } = userMerchant();
  const { fetchAllInventories, inventories } = useInventory();
  const {
    moveProduct,
    moveMultipleProducts,
    removeProduct,
    removeMultipleProducts,
    loading: addProductLoading,
  } = useAddProduct();

  const goToAddProduct = () => {
    navgation("/merchant/dashboard/select-inventory");
  };

  const toggleDropdown = (productId) => {
    setActiveDropdownId((prev) => (prev === productId ? null : productId));
  };

  const closeDropdown = () => {
    setActiveDropdownId(null);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(merchantProducts.map((p) => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleOpenDeleteDialog = (productId = null, isMultiple = false) => {
    if (isMultiple && selectedProducts.length === 0) {
      showToast.info("Please select at least one product");
      return;
    }
    setDeleteDialog({ open: true, productId, isMultiple });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({ open: false, productId: null, isMultiple: false });
  };

  const refetchProducts = () => {
    if (merchantId) fetchMerchantProducts(merchantId);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (deleteDialog.isMultiple) {
        await removeMultipleProducts(selectedProducts);
        setSelectedProducts([]);
      } else {
        await removeProduct(deleteDialog.productId);
        setSelectedProducts((prev) =>
          prev.filter((id) => id !== deleteDialog.productId)
        );
      }
      refetchProducts();
      handleCloseDeleteDialog();
    } catch (error) {
      console.error("Error deleting product(s):", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMoveSingle = async (productId, storeId) => {
    await moveProduct(productId, storeId);
    setMoveModalProduct(null);
    refetchProducts();
  };

  const getImageSrc = (product) => {
    const media = product?.mediaList?.[0];

    if (!media) return ImageNotFound;

    let src = "";

    if (media.mediaId) {
      src = `${imageUrl}${media.mediaId}`;
    }
    else if (media.url) {
      src = media.url;
    }

    if (src && src.includes("img")) {
      return ImageNotFound;
    }

    return src || ImageNotFound;
  };


  const handleMoveMultiple = async (productIds, storeId) => {
    await moveMultipleProducts(productIds, storeId);
    setIsMoveMultiOpen(false);
    setSelectedProducts([]);
    refetchProducts();
  };

  const selectedProductObjects = merchantProducts.filter((p) =>
    selectedProducts.includes(p.id)
  );
  const isAllSelected =
    merchantProducts.length > 0 &&
    selectedProducts.length === merchantProducts.length;
  const hasSelection = selectedProducts.length > 0;

  const getDeleteDialogContent = () => {
    if (deleteDialog.isMultiple) {
      return {
        title: "Delete Multiple Products",
        message: `Are you sure you want to delete ${selectedProducts.length} product(s)? This action cannot be undone.`,
      };
    }
    const product = merchantProducts.find(
      (p) => p.id === deleteDialog.productId
    );
    return {
      title: "Delete Product",
      message: `Are you sure you want to delete "${product?.productTitle_i18n?.en || "this product"}"? This action cannot be undone.`,
    };
  };

  useEffect(() => {
    if (merchantId) {
      fetchMerchantProducts(merchantId);
      fetchAllInventories();
    }
  }, [merchantId, fetchMerchantProducts]);

  const inventoryOptions = inventories.map((inv) => ({
    value: inv?.id,
    label: inv?.storeName || inv?.name || "Unnamed Store",
  }));

  return (
    <>
      <FilterProductsModal isOpen={isOpen} setIsOpen={setIsOpen} />

      <MoveProductModal
        isOpen={!!moveModalProduct}
        onClose={() => setMoveModalProduct(null)}
        product={moveModalProduct}
        stores={inventoryOptions}
        onMove={handleMoveSingle}
        loading={addProductLoading}
      />

      <MoveMultipleProductsModal
        isOpen={isMoveMultiOpen}
        onClose={() => setIsMoveMultiOpen(false)}
        products={selectedProductObjects}
        stores={inventoryOptions}
        onMove={handleMoveMultiple}
        loading={addProductLoading}
      />

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title={getDeleteDialogContent().title}
        message={getDeleteDialogContent().message}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        loading={isDeleting}
      />

      <div className="products-management">
        <div className="products-header">
          <h1 className="products-title">Products Management</h1>
          <p className="products-subtitle">
            Manage all products in one place and adapt them for different
            selling models.
          </p>
        </div>

        <div className="products-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`products-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="products-filters-row">
          <div className="store-filters">
            {storeFilters.map((store) => (
              <button
                key={store.id}
                className={`store-filter-btn ${activeStore === store.id ? "active" : ""}`}
                onClick={() => setActiveStore(store.id)}
              >
                {store.label}{" "}
                <span className="store-count">({store.count})</span>
              </button>
            ))}
            <button className="upgrade-plan-link">Upgrade Your Plan</button>
          </div>

          <div className="products-actions">
            <button onClick={() => setModalOpen(true)} className="import-btn">
              <Import size={18} />
              Import Products sheet
            </button>
            <button className="add-product-btn" onClick={goToAddProduct}>
              <Plus size={18} />
              Add Product
            </button>
          </div>
        </div>

        <div className="products-table-container">
          <div className="products-toolbar">
            <div className="search-filter-group">
              <div className="search-input-wrapper">
                <Search size={20} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search for Product Name ,SKU"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="filter-btn" onClick={() => setIsOpen(true)}>
                <Filter size={20} />
              </button>
            </div>

            <div className="toolbar-actions">
              <button className="toolbar-icon-btn" disabled={!hasSelection}>
                <Discount size={20} />
              </button>
              <button
                className="toolbar-icon-btn"
                onClick={() => handleOpenDeleteDialog(null, true)}
              >
                <Trash2 size={20} />
              </button>
              <button
                className="move-product-btn"
                disabled={!hasSelection}
                onClick={() => setIsMoveMultiOpen(true)}
              >
                Move Product
              </button>
            </div>
          </div>
        </div>

        <table className="products-table">
          <thead>
            <tr>
              <th className="checkbox-col">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="item-name-col">Item Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Inventory Tracker</th>
              <th>Quantity</th>
              <th>Unit price</th>
              <th>Sales Method</th>
              <th>Status</th>
              <th className="actions-col"></th>
            </tr>
          </thead>
          <tbody>
            {merchantProducts.map((product) => (
              <tr key={product.id}>
                <td className="checkbox-col">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => handleSelectProduct(product.id)}
                  />
                </td>
                <td className="item-name-col">
                  <div className="product-info">
                    <div className="product-image">


                      <img
                        src={getImageSrc(product)}
                        alt={product?.title_i18n?.en || "product image"}
                      />
                    </div>
                    <span className="product-name">
                      {product?.title_i18n?.en || ""}
                    </span>
                  </div>
                </td>
                <td>{product.sku?.length || "no sku"}</td>
                <td>{product.categoryName_i18n?.en || "no category"}</td>
                <td>{product.inventoryTracker || "no inventory tracker"}</td>
                <td>{product.quantity || "no quantity"}</td>
                <td>{product.price?.JO?.listPrice || "no price"}</td>
                <td>
                  <div className="sales-method-cell">
                    {product?.salesMethod?.join(", ")}
                    {product?.discount && (
                      <span className="discount-tag">
                        , {product?.discount || "no discount"} Discounts
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <span className="status-active">{product.status}</span>
                </td>
                <td className="actions-col">
                  <div style={{ position: "relative" }}>
                    <button
                      className="row-actions-btn"
                      onClick={() => toggleDropdown(product.id)}
                    >
                      <Dotes size={24} />
                    </button>
                    <RowActionsDropdown
                      isOpen={activeDropdownId === product.id}
                      onClose={closeDropdown}
                      onEdit={() => {
                        navgation(`/merchant/dashboard/add-product?productId=${product.id}`);
                        closeDropdown();
                      }}
                      onAddDiscount={() => {
                        console.log("Add discount", product.id);
                        closeDropdown();
                      }}
                      onMoveTo={() => {
                        if (selectedProducts.length > 1) {
                          setIsMoveMultiOpen(true);
                        } else {
                          setMoveModalProduct(product);
                        }
                        closeDropdown();
                      }}
                      onRemove={() => {
                        handleOpenDeleteDialog(product.id, false);
                        closeDropdown();
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ImportProductsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

export default ProductsManagement;