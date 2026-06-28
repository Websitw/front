import { useState } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import CheckIcon from "@mui/icons-material/Check";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import IdentifiersPricingTab from "./IdentifiersPricingTab";
import PhysicalSpecsTab from "./PhysicalSpecsTab";
import WholesaleTiersTab from "./WholesaleTiersTab";
import { PRIMARY, primaryBtnStyle, outlineBtnStyle } from "../styles/variantStyles";

export default function VariantEditPanel({
  variantIndex,
  control,
  variantErrors,
  onSave,
  onDiscard,
  onCopyTiersToAll,
}) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ borderTop: "1px solid #e8e8e8", background: "#fff" }}>
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{
          minHeight: "40px",
          borderBottom: "1px solid #e8e8e8",
          "& .MuiTab-root": {
            textTransform: "none",
            minHeight: "40px",
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.03em",
            color: "#999",
            gap: "6px",
            "&.Mui-selected": { color: PRIMARY },
          },
          "& .MuiTabs-indicator": {
            backgroundColor: PRIMARY,
            height: "2.5px",
          },
        }}
      >
        <Tab
          icon={<LocalOfferOutlinedIcon sx={{ width: "15px", height: "15px" }} />}
          iconPosition="start"
          label="Identifiers & pricing"
        />
        <Tab
          icon={<Inventory2OutlinedIcon sx={{ width: "15px", height: "15px", border: "1px solid #e8e8e8" }} />}
          iconPosition="start"
          label="Physical specs"
          // sx={{border:"1px solid red"}}
        />
        <Tab
          icon={<StorefrontOutlinedIcon sx={{ width: "15px", height: "15px" }} />}
          iconPosition="start"
          label="Wholesale tiers"
        />
      </Tabs>

      <div style={{ padding: "0 20px" }}>
        {activeTab === 0 && (
          <IdentifiersPricingTab variantIndex={variantIndex} control={control} variantErrors={variantErrors} />
        )}
        {activeTab === 1 && (
          <PhysicalSpecsTab variantIndex={variantIndex} control={control} variantErrors={variantErrors} />
        )}
        {activeTab === 2 && (
          <WholesaleTiersTab
            variantIndex={variantIndex}
            control={control}
            onCopyToAll={onCopyTiersToAll}
          />
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          borderTop: "1px solid #e8e8e8",
          background: "#fafafa",
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "12px",
            color: "#bbb",
          }}
        >
          <KeyboardReturnIcon sx={{ width: "14px", height: "14px" }} />
          Press ESC to close
        </span>
        <div style={{ display: "flex", gap: "10px" }}>
          <button type="button" onClick={onDiscard} style={outlineBtnStyle}>
            Discard
          </button>
          <button type="button" onClick={onSave} style={primaryBtnStyle}>
            <CheckIcon sx={{ width: "15px", height: "15px" }} />
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}