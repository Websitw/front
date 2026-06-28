import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const Congratulations = ({ emailLink }) => {
  return (
    <>
      <div className="success">
        <CheckCircleIcon className="success-icon" />
        <h2>Account Created!</h2>
        <p>Account created successfully, We have sent verification link to</p>
        <strong>{emailLink}</strong>
      </div>
    </>
  );
};

export default Congratulations;
