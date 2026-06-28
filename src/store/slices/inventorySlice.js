import { createCrudSlice } from "../utils/crudFactory";

const inventorySlice = createCrudSlice({
  name: "inventory",
  endpoint: "stores",
  selectId: "id",
});

export const {
  createItem: createInventory,
  updateItem: updateInventory,
  deleteItem: deleteInventory,
  fetchItems: fetchInventories,
} = inventorySlice.actions;

export default inventorySlice.reducer;
