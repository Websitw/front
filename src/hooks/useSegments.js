import { useState } from "react";
import { getSegmentsEnrich } from "../store/slices/segmentsSlice";
import { useDispatch, useSelector } from "react-redux";

const useSegments = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { segmentsEnrich } = useSelector((state) => state.segments);

  const fetchSegmentsEnrich = (productId) => {
    setLoading(true);
    return dispatch(getSegmentsEnrich(productId))
      .unwrap()
      .finally(() => setLoading(false));
  };

  return {
    fetchSegmentsEnrich,
    segmentsEnrich,
  };
};

export default useSegments;
