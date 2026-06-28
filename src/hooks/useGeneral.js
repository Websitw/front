import { useState } from "react";
import { fetchCountriesListAnonymous } from "../store/slices/counteriesSlice";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTaxList
} from '../store/slices/taxSlice'
const useGeneral = () => {

  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { allCountriesList } = useSelector((state) => state.countries);
  const { taxList } = useSelector((state) => state.tax);

  const fetchCountriesList = () => {
    setLoading(true);
    return dispatch(fetchCountriesListAnonymous())
      .unwrap()
      .finally(() => setLoading(false));
  };

  const fetchTaxClasses = () => {
    setLoading(true);
    return dispatch(fetchTaxList())
      .unwrap()
      .finally(() => setLoading(false));
  };

  return {
    fetchCountriesList,
    countries:allCountriesList,
    fetchTaxClasses,
    taxList,
    loading
  };
};

export default useGeneral;
