import { createCrudSlice } from "../utils/crudFactory";


const limitSlice = createCrudSlice({
  name: 'limit',
  endpoint: '/limits',
  selectId: 'id',
});

export const {
    fetchItems: fetchLimits,
    createItem: createLimit,
    updateItem: updateLimit,
    deleteItem: deleteLimit,
} = limitSlice.actions;

export default limitSlice.reducer;