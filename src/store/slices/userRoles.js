import { createCrudSlice } from "../utils/crudFactory";

const userRolesSlice = createCrudSlice({
  name: "userRoles",
  endpoint: "roles/user",
});

export const {
  fetchItems: getUserRoles,
  createItem: createUserRole,
  updateItem: updateUserRole,
  deleteItem: deleteUserRole,
} = userRolesSlice.actions;

export default userRolesSlice.reducer;
