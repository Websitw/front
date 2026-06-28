import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  IconButton,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import { DeleteMark } from "../../../assets/icons/index";

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  confirmColor = "error",
  loading = false,
}) => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isRTL = i18n.language === "ar";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      dir={isRTL ? "rtl" : "ltr"}
      PaperProps={{
        sx: {
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          padding: { xs: "24px 20px", sm: "32px 28px" },
          position: "relative",
          width: { xs: "calc(100% - 32px)", sm: "404px" },
          maxWidth: { xs: "calc(100% - 32px)", sm: "404px" },
          minHeight: { xs: "auto", sm: "263px" },
          margin: { xs: "16px", sm: "auto" },
          maxHeight: { xs: "calc(100vh - 32px)", sm: "calc(100vh - 100px)" },
          display: "flex",
          flexDirection: "column",
          
        },
      }}
    >
      {/* Close Button */}
      <IconButton
        aria-label="close"
        onClick={onClose}
        disabled={loading}
        sx={{
          position: "absolute",
          right: isRTL ? "auto" : 12,
          left: isRTL ? 12 : "auto",
          top: 12,
          color: "#151515",
          zIndex: 3000,
          padding: "8px",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.04)",
          },
        }}
      >
        <CloseIcon sx={{ fontSize: 22 }} />
      </IconButton>

      {/* Warning Icon */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          marginBottom: { xs: 2, sm: 2 },
          marginTop: { xs: 0.5, sm: 0 },
        }}
      >
        <DeleteMark
          style={{
            width: isMobile ? 48 : 56,
            height: isMobile ? 48 : 56,
          }}
        />
      </Box>

      {/* Title */}
      <DialogTitle
        sx={{
          textAlign: "center",
          color: "#151515",
          fontSize: { xs: "20px", sm: "20px" },
          fontWeight: 600,
          padding: 0,
          marginBottom: { xs: 1, sm: 1.5 },
          lineHeight: 1.3,
        }}
      >
        {title || t("confirm_dialog.default_title")}
      </DialogTitle>

      {/* Content */}
      <DialogContent
        sx={{
          padding: 0,
          marginBottom: { xs: 2.5, sm: 3 },
          flex: "1 1 auto",
          overflow: "auto",
        }}
      >
        <DialogContentText
          sx={{
            color: "#4A4A4A",
            fontSize: { xs: "16px", sm: "16px" },
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          {message || t("confirm_dialog.default_message")}
        </DialogContentText>
      </DialogContent>

      {/* Actions */}
      <DialogActions
        sx={{
          padding: 0,
          gap: { xs: 1.5, sm: 2 },
          flexDirection: "row",
          justifyContent: "center",
          marginTop: "auto",
        }}
      >
        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          sx={{
            flex: 1,
            maxWidth: { xs: "48%", sm: "160px" },
            backgroundColor: "#D83020",
            color: "#FFFFFF",
            textTransform: "none",
            fontSize: { xs: "0.875rem", sm: "0.9375rem" },
            fontWeight: 500,
            padding: { xs: "11px 20px", sm: "12px 24px" },
            borderRadius: "50px",
            boxShadow: "none",
            "&:hover": {
              backgroundColor: "#C02818",
              boxShadow: "none",
            },
            "&:disabled": {
              backgroundColor: "#D83020",
              opacity: 0.6,
            },
          }}
        >
          {loading
            ? t("confirm_dialog.loading")
            : confirmText || t("confirm_dialog.confirm")}
        </Button>
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          sx={{
            flex: 1,
            maxWidth: { xs: "48%", sm: "160px" },
            backgroundColor: "#FFFFFF",
            color: "#151515",
            borderColor: "var(--color-border)",
            textTransform: "none",
            fontSize: { xs: "0.875rem", sm: "0.9375rem" },
            fontWeight: 500,
            padding: { xs: "11px 20px", sm: "12px 24px" },
            borderRadius: "50px",
            "&:disabled": {
              backgroundColor: "#FFFFFF",
              borderColor: "#E0E0E0",
              opacity: 0.6,
            },
          }}
        >
          {cancelText || t("confirm_dialog.cancel")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;