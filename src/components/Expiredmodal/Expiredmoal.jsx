import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice";

const SessionExpiredModal = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    dispatch(logout());
    window.dispatchEvent(new Event("authStateChanged"));
    navigate("/");
    onClose();
  };

  return (
    <Dialog
      open={open}
      maxWidth="xs"
      fullWidth
      disableEscapeKeyDown
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: 2,
          padding: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          pt: 3,
        }}
      >
        <ErrorOutlineIcon
          sx={{
            fontSize: 60,
            color: "error.main",
          }}
        />
        <Typography variant="h6" component="div" fontWeight="bold">
          {t("sessionExpired")}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography
          variant="body1"
          align="center"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          {t("sessionExpiredMessage")}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
        <Button
          onClick={handleLogout}
          variant="contained"
          color="primary"
          size="large"
          sx={{ minWidth: 120 }}
        >
          {t("loginAgain")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionExpiredModal;