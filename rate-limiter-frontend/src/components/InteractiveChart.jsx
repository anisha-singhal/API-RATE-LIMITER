import { useState, useEffect, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const InteractiveChart = ({ onDataPointClick }) => {
  const [data, setData] = useState([]);
  const [deployments, setDeployments] = useState([]);

  useEffect(() => {
    const now = Date.now();
    const initialData = [];
    for (let i = 59; i >= 0; i--) {
      const timestamp = now - i * 1000 * 60; // Faking 60 minutes of data
      initialData.push({
        time: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        successful: Math.floor(Math.random() * 50) + 10,
        blocked: Math.floor(Math.random() * 15) + 2,
        timestamp,
      });
    }
    setData(initialData);
  }, []);

  const handleChartClick = useCallback((data) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const clickedData = data.activePayload[0].payload;
      onDataPointClick(clickedData.timestamp);
    }
  }, [onDataPointClick]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-700/80 rounded-lg p-3 shadow-lg border border-gray-600 backdrop-blur-sm">
          <p className="text-sm text-gray-300 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-sm text-white">{entry.name}:</span>
              </div>
              <span className="text-sm font-medium text-white">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 mb-8 border border-gray-700 backdrop-blur-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white">Interactive Traffic Analysis</h2>
        <div className="flex items-center space-x-6 mt-4">
          <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-blue-500 rounded-full" /><span className="text-sm text-gray-400">Successful</span></div>
          <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-red-500 rounded-full" /><span className="text-sm text-gray-400">Blocked</span></div>
        </div>
      </div>
      
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} onClick={handleChartClick} className="cursor-crosshair">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="successful"
              stroke="#3B82F6" // Blue
              strokeWidth={2}
              dot={false}
              name="Successful"
            />
            <Line
              type="monotone"
              dataKey="blocked"
              stroke="#EF4444" // Red
              strokeWidth={2}
              dot={false}
              name="Blocked"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default InteractiveChart;