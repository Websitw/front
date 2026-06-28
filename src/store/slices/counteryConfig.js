import { createCrudSlice } from "../utils/crudFactory";


const countriesConfigSlice = createCrudSlice({
  name: "countries/config",
  endpoint: "countries/config",
  selectId:'selectedCountryId',
});

export const {
  createItem: createCountriesConfig,
  getItem: getCountriesConfig,

} = countriesConfigSlice.actions;

export default countriesConfigSlice.reducer;