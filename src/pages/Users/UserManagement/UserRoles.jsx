const UserRoles = ({ setStep }) => {
  return (
    <div className="drawer-body">
      <p className="step-two-type">Premotion Type</p>
      {["Dashboard", "Analytics", "Merchants (Sellers)", "Promotion Name"].map(
        (item) => (
          <div className="toggle-row" key={item}>
            <span>{item}</span>
            <label className="switch">
              <input type="checkbox" />
              <span className="slider" />
            </label>
          </div>
        )
      )}

      <button className="primary-btn" onClick={() => setStep(3)}>
        Create & Send username & Password
      </button>
    </div>
  );
};

export default UserRoles;
