import { createCrudSlice } from "../utils/crudFactory";


const documentCounterySlice = createCrudSlice({
  name: "documentCountery",
  endpoint: "/documentcountery",
  selectId:'id'
});

export const {
  fetchItems: fetchDocumentCounteries,
  createItem: createDocumentCountery,
  updateItem: updateDocumentCountery,
  deleteItem: deleteDocumentCountery,
} = documentCounterySlice.actions;

export default documentCounterySlice.reducer;
