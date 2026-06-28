import { createCrudSlice } from "../utils/crudFactory";

const storeAgreeSlice = createCrudSlice({
  name: "storeAgree",
  endpoint: "/store-agree",
});

export const {
  fetchItems: fetchStoreAgreements,
  createItem: createStoreAgreement,
  updateItem: updateStoreAgreement,
  deleteItem: deleteStoreAgreement,
} = storeAgreeSlice.actions;

export default storeAgreeSlice.reducer;
