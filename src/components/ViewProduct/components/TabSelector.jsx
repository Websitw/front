
const TabSelector = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="tab-selector">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          className={`tab-btn-view-product ${activeTab === tab.value ? "active" : ""}`}
          onClick={() => onTabChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default TabSelector;