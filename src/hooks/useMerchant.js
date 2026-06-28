import { useCallback } from "react";
import { getMerchantProducts } from "../store/slices/merchantsuser";
import { fetchMerchants } from "../store/slices/merchants";
import { useDispatch, useSelector } from "react-redux";

const useMerchant = () => {
  const dispatch = useDispatch();

  const merchantProducts = useSelector(
    (state) => state.merchantsUser.merchantProducts,
  );

  const merchants = useSelector((state) => state.merchants.merchants);

  const fetchMerchantProducts = useCallback(
    (id) => dispatch(getMerchantProducts(id)).unwrap(),
    [dispatch],
  );

  const fetchAllMerchants = useCallback(
    () =>
      dispatch(fetchMerchants())
        .unwrap()
        .catch((err) => console.error("Error fetching merchants:", err)),
    [dispatch],
  );

  return {
    fetchMerchantProducts,
    fetchAllMerchants,
    merchantProducts,
    merchants,
  };
};

export default useMerchant;
