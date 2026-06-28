import { createCrudSlice } from "../utils/crudFactory";

const languageSlice = createCrudSlice({
  name: "languages",
  endpoint: "languages",
  selectId: "id",
});

export const {
  fetchItems: fetchLanguages,
  createItem: createLanguage,
  updateItem: updateLanguage,
  deleteItem: deleteLanguage,
  deleteItemsBulk: deleteLanguagesBulk,
  
} = languageSlice.actions;

export default languageSlice.reducer;
