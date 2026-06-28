import { createCrudSlice } from "../utils/crudFactory";


const checkoutSlice = createCrudSlice({
  name: "checkOut/config",
  endpoint: "checkout",
});

export const {
  createItem: createCheckOut,
  getItem: getCheckOutDetails,
  patchItem: patchCheckOut,

} = checkoutSlice.actions;

export default checkoutSlice.reducer;