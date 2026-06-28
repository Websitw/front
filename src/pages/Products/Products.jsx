import { useState, useEffect } from "react";
import BackButton from "../../components/common/BackButton/BackButton";
import MerchantProductCard from "./MerchantProductCard/MerchantProductCard";
import { ProductLogo } from "../../assets/image";
import { AddButton } from "../../assets/icons";
import AddInventoryCard from "./AddInventoryCard/AddInventoryCard";
import InventoryFormModal from "../../components/MerchantDashboard/InventoryFormModal/InventoryFormModal";
import ConfirmDialog from "../../components/Admin/Modal/Modal";
import useInventory from "../../hooks/useInventory";
import "./Products.css";
import { useNavigate } from "react-router-dom";
import { showToast } from "../../components/CustomToast/CustomToast";

function Products() {
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInventory, setEditingInventory] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    inventoryId: null,
  });

  const {
    inventories,
    loading,
    fetchAllInventories,
    addInventory,
    editInventory,
    removeInventory,
  } = useInventory();

  const navigate = useNavigate();

  useEffect(() => {
    fetchAllInventories();
  }, []);

  const goToAddProduct = () => {
    if (!selectedInventory) {
      showToast.info("Please select an inventory before adding a product.");
      return;
    }
    navigate(`/merchant/dashboard/add-product?inventoryId=${selectedInventory}`);
  };

  const handleAddNew = () => {
    setEditingInventory(null);
    setIsFormOpen(true);
  };

  const handleEdit = (inventory) => {
    setEditingInventory(inventory);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (payload) => {
    if (editingInventory) {
      const result = await editInventory(editingInventory.id, payload);
      if (result.success) {
        fetchAllInventories();
      }
    } else {
      const result = await addInventory(payload);
      if (result.success) {
        fetchAllInventories();
      }
    }
  };

  const handleOpenDelete = (inventoryId) => {
    setDeleteDialog({ open: true, inventoryId });
  };

  const handleConfirmDelete = async () => {
    const result = await removeInventory(deleteDialog.inventoryId);
    if (result.success) {
      if (selectedInventory === deleteDialog.inventoryId) {
        setSelectedInventory(null);
      }
      fetchAllInventories();
    }
    setDeleteDialog({ open: false, inventoryId: null });
  };

  console.log("Inventories:", inventories);
  return (
    <div className="merchant-dashboard">
      <BackButton
        redirectTo="/merchant/dashboard/products"
        label="Add Product"
      />
      <div className="merchant-products-content">
        <div className="merchant-products-header">
          <h3>Select Inventory</h3>
          <button
            className="merchant-products-button"
            onClick={goToAddProduct}
          >
            <AddButton />
            Add Product
          </button>
        </div>
        <div className="merchant-products-grid">
          {inventories?.map((inventory) => (
            <MerchantProductCard
              key={inventory.id}
              logo={ProductLogo}
              inventoryName={inventory.storeName}
              plan="Free Plan"
              storageUsed={0}
              storageTotal={inventory.storageSpace}
              selected={selectedInventory === inventory.id}
              onSelect={() => setSelectedInventory(inventory.id)}
              onUpgrade={() => console.log("Upgrade:", inventory.id)}
              onEdit={() => handleEdit(inventory)}
              onDelete={() => handleOpenDelete(inventory.id)}
            />
          ))}
          <AddInventoryCard onClick={handleAddNew} />
        </div>
      </div>

      <InventoryFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingInventory(null);
        }}
        onSubmitForm={handleFormSubmit}
        inventory={editingInventory}
      />

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, inventoryId: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Inventory"
        message="Are you sure you want to delete this inventory? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        loading={loading}
      />
    </div>
  );
}

export default Products;