import "./ViewAllCard.css";


const ViewAllCard = ({ title = "", image, hasOverlay = false }) => {

  return (
    <div
      className={`view-all-card `}
      style={{
        backgroundImage: `url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
        {hasOverlay && <div className="view-all-card__overlay" />}
      <h1 className="view-all-card__text">{title}</h1>
      {/* <button className="view-all-card__button">View All</button> */}
    </div>
  );
};

export default ViewAllCard;