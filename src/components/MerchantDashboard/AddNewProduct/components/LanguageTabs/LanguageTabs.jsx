import './LanguageTabs.css';

const LanguageTabs = ({ activeTab, onTabChange, tabs = [] }) => {
  return (
    <div className="language-tabs">
      <div className="language-tabs__list">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={`language-tabs__tab ${activeTab === tab.value ? 'language-tabs__tab--active' : ''}`}
            onClick={() => onTabChange(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="language-tabs__line" />
    </div>
  );
};

export default LanguageTabs;