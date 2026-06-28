const SpecRow = ({ label, value }) => {
  return (
    <div className="spec-row-container">
      <span className="spec-label">{label}</span>
      <span className="spec-value">{value}</span>
    </div>
  );
}
export default SpecRow;