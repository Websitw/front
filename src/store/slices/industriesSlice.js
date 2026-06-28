import { createCrudSlice } from "../utils/crudFactory";

const industriesSlice = createCrudSlice({
  name: "industries",
  endpoint: "industries",
});

export const {
  fetchItems: fetchIndustries,
  createItem: createIndustry,
  updateItem: updateIndustry,
  deleteItem: deleteIndustry,
} = industriesSlice.actions;

export default industriesSlice.reducer;
