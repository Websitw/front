import "./AddInventoryCard.css";
import { GreenAdd } from "../../../assets/icons";
const AddInventoryCard = ({ onClick }) => {
  return (
    <div className="add-inventory-card" onClick={onClick}>
      <div className="add-inventory-card__content">
        <GreenAdd />
        <span className="add-inventory-card__text">Add a New Inventory</span>
      </div>
    </div>
  );
};

export default AddInventoryCard;