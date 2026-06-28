import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";

function valuetext(value) {
  return `${value} JOD`;
}

export default function FilterPrice({ min = 0, max = 2000, onPriceChange }) {
  const [value, setValue] = useState([min, max]);

  useEffect(() => {
    setValue([min ?? 0, max ?? 2000]);
  }, [min, max]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleChangeCommitted = (event, newValue) => {
    if (onPriceChange) {
      onPriceChange(newValue[0], newValue[1]);
    }
  };

  return (
    <Box sx={{ width: "100%", p: 4, borderRadius: 2 }}>
      <div className="filter-price-labels">
        {/* <span>{value[0]} JOD</span>
        <span>{value[1]} JOD</span> */}
      </div>
      <Slider
        getAriaLabel={() => "Price range"}
        value={value}
        min={min ?? 0}
        max={max ?? 2000}
        onChange={handleChange}
        onChangeCommitted={handleChangeCommitted}
        valueLabelDisplay="auto"
        getAriaValueText={valuetext}
        sx={{
          "& .MuiSlider-thumb": {
            width: 20,
            height: 20,
            backgroundColor: "#32A2A6",
            "&:hover, &.Mui-focusVisible": {
              boxShadow: "0 0 0 8px rgba(50, 162, 166, 0.16)",
            },
          },
          "& .MuiSlider-track": {
            height: 6,
            backgroundColor: "#0D7C85",
            border: "none",
          },
          "& .MuiSlider-rail": {
            height: 6,
            backgroundColor: "#ccc",
          },
        }}
      />
    </Box>
  );
}