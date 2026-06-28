import { Checked } from "../../../../../assets/icons";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import './Congratulation.css';

const Congratulation = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleNavigateToDashboard = () => {
        navigate('/merchant/dashboard');
    };

    return (
       <div className="congratulation-container">
           <div className="congratulation-content">
               <div className="congratulation-icon">
                   <Checked />
               </div>
               <h1 className="congratulation-title">
                   {t("merchant.completeProfile.congratulation.title")}
               </h1>
               <p className="congratulation-subtitle">
                   {t("merchant.completeProfile.congratulation.subtitle")}
               </p>
               <button
                   className="btn-dashboard"
                   onClick={handleNavigateToDashboard}
               >
                   {t("merchant.completeProfile.congratulation.button")}
               </button>
           </div>
       </div>
    );
};

export default Congratulation;