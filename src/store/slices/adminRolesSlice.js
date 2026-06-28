import { createCrudSlice } from "../utils/crudFactory";

const adminRolesSlice = createCrudSlice({
  name: "adminRoles",
  endpoint: "roles/config",
});

export const {
  fetchItems: getAdminRoles,
  getItem: getAdminRole,
  createItem: createAdminRole,
  updateItem: updateAdminRole,
  deleteItem: deleteAdminRole,
} = adminRolesSlice.actions;

export default adminRolesSlice.reducer;
