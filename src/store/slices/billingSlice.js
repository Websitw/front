import { createCrudSlice } from "../utils/crudFactory";

const billingSlice = createCrudSlice({
  name: "billing",
  endpoint: "merchants/billings",
  selectId: "id",
});

export const {
  fetchItems: fetchBilling,
  createItem: createBilling,
  updateItem: updateBilling,
  deleteItem: deleteBilling,
} = billingSlice.actions;

export default billingSlice.reducer;
