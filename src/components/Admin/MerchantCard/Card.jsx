import "./Card.css";
import { imageUrl } from "../../../helper/helper";

function Card({ name, id, onDelete, deleteName, merchant_logo }) {
  
  return (
    <div className="card" key={id}>
      <img
        style={{
          cursor: "pointer",
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
        src={`${imageUrl}${merchant_logo}`}
      />
      <h4 className="title">{name}</h4>
      <p className="descriptionItem">sacsacsacascs</p>

      <button className="delete-merchant" onClick={() => onDelete(id)}>
        <>
          {deleteName ? deleteName : "Delete"}
        </>     
      </button>
    </div>
  );
}

export default Card;