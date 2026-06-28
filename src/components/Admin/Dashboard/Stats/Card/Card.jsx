function Card({ stat }) {
  return (
    <div key={stat.title} className="stat-card">
      <div className="stat-card-header">
        <div className="stat-icon">{stat.icon}</div>
        <div className="stat-percentage">{stat.percentage}</div>
      </div>
      <div className="stat-value">{stat.value}</div>
      <div className="stat-title">{stat.title}</div>
      <div className="stat-description">{stat.description}</div>
      {stat.details && (
        <div className="stat-details">
          {stat.details.map((detail, index) => (
            <div key={index} className="stat-detail-item">
              <span className="stat-detail-label">{detail.label}:</span>
              <span className="stat-detail-value">{detail.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Card;
