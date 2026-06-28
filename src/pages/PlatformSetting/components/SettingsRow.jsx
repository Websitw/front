import EastIcon from "@mui/icons-material/East";

const SettingsRow = ({ title, desc, onClick }) => {
  return (
    <div className="settings-row clickable" onClick={onClick}>
      <div>
        <p className="settings-row-title">{title}</p>
        <p className="settings-row-desc">{desc}</p>
      </div>

      <span className="settings-arrow">
        <EastIcon
          style={{
            padding: "5px",
            fontSize: "24px",
            color: "#2BA9A8",
            fill: "#2BA9A8",
            borderRadius: "50px",
            border: "1px solid #2BA9A8",
          }}
        />
      </span>
    </div>
  );
};

export default SettingsRow;