import { createCrudSlice } from "../utils/crudFactory";

const userOrderSlice = createCrudSlice({
  name: "userOrders",
  endpoint: "orders",
});

export const {
  fetchItems: fetchUserOrders,
  createItem: createUserOrder,
  deleteItem: deleteUserOrder,
  getItem: getUserOrder,
} = userOrderSlice.actions;

export default userOrderSlice.reducer;
