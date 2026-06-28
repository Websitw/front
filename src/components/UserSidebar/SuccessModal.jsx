import React from "react";
import CongratulationIcon from "../../assets/userSidebar/Congratulation.svg";
import "./SuccessModal.css";

const SuccessModal = ({ isOpen, onClose }) => {
  return (
    <div className={`success-modal-comp ${isOpen ? "success-modal-comp--open" : ""}`}>
      <button className="success-modal-comp__close-btn" onClick={onClose}>
        ×
      </button>

      <div className="success-modal-comp__content">
        <img
          src={CongratulationIcon}
          alt="Success"
          className="success-modal-comp__icon"
        />
        <h2 className="success-modal-comp__title">Congratulation!</h2>
        <p className="success-modal-comp__text">
          Your account is complete. Now you can start and find best Deals.
        </p>
        <button className="success-modal-comp__btn" onClick={onClose}>
          Get Started
        </button>
      </div>

      <div className="success-modal-comp__footer">
        © Copyright SAWA 2026. All right reserved
      </div>
    </div>
  );
};

export default SuccessModal;
