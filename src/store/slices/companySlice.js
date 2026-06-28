import { createCrudSlice } from "../utils/crudFactory";

const companiesSlice = createCrudSlice({
  name: "companies",
  endpoint: "companies",
});

export const {
  createItem: createCompany,
  updateItem: updateCompany,
  getItem: getCompany,
  deleteItem: deleteCompany,
} = companiesSlice.actions;

export default companiesSlice.reducer;