import React from 'react';
import { ShoppingCart, Grid3x3, Users, MessageSquare } from 'lucide-react';
import './StatsCard.css';

const StatsCard = ({ 
  type, 
  count, 
  change, 
  changeLabel, 
  icon: Icon, 
  bgColor, 
  iconBgColor 
}) => {
  return (
    <div className="stats-card" style={{ backgroundColor: bgColor }}>
      <div className="stats-card-header">
        <h3 className="stats-card-title">{type}</h3>
        <div className="stats-card-icon" style={{ backgroundColor: iconBgColor }}>
          <Icon size={24} />
        </div>
      </div>
      <div className="stats-card-count">{count}</div>
      <div className="stats-card-footer">
        <span className="stats-card-change">{change}</span>
        <span className="stats-card-label">{changeLabel}</span>
      </div>
    </div>
  );
};

export default StatsCard;