import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Statistics.css';

const merchantRevenueData = [
  { name: 'Merchant A', value: 35 },
  { name: 'Merchant B', value: 25 },
  { name: 'Merchant C', value: 40 },
];

const storesSalesData = [
  { quarter: 'Q1', 'Store A': 12000, 'Store B': 10000, 'Store C': 20000 },
  { quarter: 'Q2', 'Store A': 15000, 'Store B': 14000, 'Store C': 18000 },
  { quarter: 'Q3', 'Store A': 18000, 'Store B': 10000, 'Store C': 22000 },
  { quarter: 'Q4', 'Store A': 9000, 'Store B': 8000, 'Store C': 12000 },
];

const CHART_COLORS = {
  storeA: '#A8B8E6',
  storeB: '#F4D35E',
  storeC: '#7BC8A4',
};

const CustomLegend = ({ payload, type }) => {
  return (
    <div className={`custom-legend ${type === 'pie' ? 'legend-pie' : 'legend-bar'}`}>
      {payload.map((entry, index) => (
        <div key={`legend-${index}`} className="legend-item">
          <div 
            className="legend-dot"
            style={{ backgroundColor: entry.color }}
          />
          <span className="legend-text">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const Statistics = () => {
  return (
    <div className="statistics-container">
      <div className="chart-card revenue-card">
        <h3 className="chart-title">
          Merchants Revenue
        </h3>
        
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={merchantRevenueData}
              cx="50%"
              cy="50%"
              innerRadius={0}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {merchantRevenueData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={Object.values(CHART_COLORS)[index]}
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            />
            <Legend 
              content={<CustomLegend type="pie" />}
              verticalAlign="top"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card sales-card">
        <h3 className="chart-title">
          Stores Sales
        </h3>
        
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={storesSalesData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            barGap={4}
            barCategoryGap="20%"
          >
            <CartesianGrid 
              strokeDasharray="0" 
              stroke="#D5E7D6"
              vertical={false}
            />
            <XAxis 
              dataKey="quarter" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8B92A7', fontSize: 14 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8B92A7', fontSize: 14 }}
              ticks={[0, 5000, 10000, 15000, 20000, 25000]}
              domain={[0, 25000]}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            />
            <Legend 
              content={<CustomLegend type="bar" />}
              verticalAlign="top"
            />
            <Bar dataKey="Store A" fill={CHART_COLORS.storeA} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Store B" fill={CHART_COLORS.storeB} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Store C" fill={CHART_COLORS.storeC} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Statistics;