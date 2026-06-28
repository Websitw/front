import { createCrudSlice } from "../utils/crudFactory";

const addressSlice = createCrudSlice({
  name: "address",
  endpoint: "addresses",
  selectId: "id",
});

export const {
  createItem: createAddress,
  updateItem: updateAddress,
  deleteItem: deleteAddress,
} = addressSlice.actions;

export default addressSlice.reducer;
