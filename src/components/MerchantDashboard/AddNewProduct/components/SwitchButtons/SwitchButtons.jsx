import "./SwitchButtons.css";

const SwitchButtons = ({ activeStep, totalSteps, onNext, onPrevious, onSubmit, isEditMode }) => {
  const isLastStep = activeStep === totalSteps;

  const handleNextClick = () => {
    if (isLastStep && onSubmit) {
      onSubmit();
    } else {
      onNext();
    }
  };

  return (
    <div className="switch-btns">
      <button
        className="switch-per-btn"
        onClick={onPrevious}
        disabled={activeStep === 1}
      >
        Previous
      </button>
      <button
        className="switch-next-btn"
        onClick={handleNextClick}
      >
        {isLastStep ? (isEditMode ? "Save Changes" : "Submit") : "Next"}
      </button>
    </div>
  );
};

export default SwitchButtons;