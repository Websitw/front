import { Link } from "react-router-dom";
import { Back } from "../../../assets/icons";
import "./BackButton.css";

const BackButton = ({ redirectTo, label, children = null }) => {
  return (
    <div className="merchant-back-to">
      <div>
      <Link to={redirectTo} className="merchant-back-to-link">
        <Back />
        Back
      </Link>
      <h2 className="merchant-back-to-label">{label}</h2>
      </div>
      {children}
    </div>
  );
};

export default BackButton;
