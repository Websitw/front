import { createCrudSlice } from "../utils/crudFactory";

const adminModulesSlice = createCrudSlice({
  name: "adminModules",
  endpoint: "modules",
});

export const {
  fetchItems: getAdminModules,
  createItem: createAdminModule,
  updateItem: updateAdminModule,
  deleteItem: deleteAdminModule,
} = adminModulesSlice.actions;

export default adminModulesSlice.reducer;
