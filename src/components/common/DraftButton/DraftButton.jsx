import './DraftButton.css';

const DraftButton = ({ onClick, textButton }) => {
  return (
    <button className="draft-btn" onClick={onClick}>
      {textButton}
    </button>
  );
};

export default DraftButton;