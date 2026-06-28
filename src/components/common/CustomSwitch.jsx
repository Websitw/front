import Switch from "@mui/material/Switch";
import { styled } from "@mui/material/styles";

const CustomSwitch = styled(Switch, {
  shouldForwardProp: (prop) =>
    !['containerWidth', 'containerHeight', 'thumbWidth', 'thumbHeight', 'activeColor', 'inactiveColor', 'thumbColor'].includes(prop),
})(({ 
  theme, 
  containerWidth = 32, 
  containerHeight = 16, 
  thumbWidth = 12, 
  thumbHeight = 12,
  activeColor = '#3b82f6',
  inactiveColor = '#cbd5e1',
  thumbColor = '#fff'
}) => ({
  width: containerWidth,
  height: containerHeight,
  marginBottom: 8,
  padding: 0,
  display: 'flex',
  '&:active': {
    '& .MuiSwitch-thumb': {
      width: thumbWidth,
    },
    '& .MuiSwitch-switchBase.Mui-checked': {
      transform: `translateX(${containerWidth - thumbWidth - 4}px)`,
    },
  },
  '& .MuiSwitch-switchBase': {
    padding: 2,
    '&.Mui-checked': {
      transform: `translateX(${containerWidth - thumbWidth - 4}px)`,
      color: thumbColor,
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: activeColor,
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
    width: thumbWidth,
    height: thumbHeight,
    borderRadius: thumbWidth / 2,
    transition: theme.transitions.create(['width'], {
      duration: 200,
    }),
  },
  '& .MuiSwitch-track': {
    borderRadius: containerHeight / 2,
    opacity: 1,
    backgroundColor: inactiveColor,
    boxSizing: 'border-box',
  },
}));

export default CustomSwitch;