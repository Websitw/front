import './Background.css';

const Background = ({ title, description, image}) => {
  return (
    <div className="background-content">
      <div className="overlay-less"></div>
      <img src={image} alt="Merchant Login"  className='login-bg'/>
      <div className="bg-content">
        <h1>{title}</h1>
        <p>{description}</p>
        <div className="dots">
          <span className="dot active"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>
    </div>
  );
};

export default Background;
