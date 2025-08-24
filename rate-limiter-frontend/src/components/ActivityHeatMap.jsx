import { useState, useEffect } from "react";

const ActivityHeatMap = () => {
  const [heatMapData, setHeatMapData] = useState([]);

  useEffect(() => {
    // Generate data for the last 60 minutes
    const data = [];
    for (let i = 0; i < 60; i++) {
      const requests = Math.floor(Math.random() * 100);
      let intensity = 0;
      
      if (requests > 75) intensity = 3;
      else if (requests > 50) intensity = 2;
      else if (requests > 25) intensity = 1;
      
      data.push({
        minute: i,
        intensity,
        requests,
      });
    }
    setHeatMapData(data);
  }, []);

  // Update data periodically (this part is for simulation)
  useEffect(() => {
    const interval = setInterval(() => {
      setHeatMapData((prevData) => {
        const newData = [...prevData];
        const requests = Math.floor(Math.random() * 100);
        let intensity = 0;
        
        if (requests > 75) intensity = 3;
        else if (requests > 50) intensity = 2;
        else if (requests > 25) intensity = 1;
        
        newData.shift(); // Remove the oldest data point
        newData.push({ // Add the newest data point
          minute: 59,
          intensity,
          requests,
        });
        
        return newData;
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const getTooltipContent = (cell) => {
    const now = new Date();
    const cellTime = new Date(now.getTime() - (59 - cell.minute) * 60000);
    return `${cellTime.toLocaleTimeString()}: ${cell.requests} requests`;
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 mb-8 border border-gray-700 backdrop-blur-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white mb-2">
          Activity Heat Map (Last Hour)
        </h2>
        <p className="text-sm text-gray-400">
          Request intensity per minute - darker means higher traffic
        </p>
      </div>
      
      {/* --- THIS IS THE CORRECTED LINE --- */}
      <div className="flex flex-wrap gap-1.5">
        {heatMapData.map((cell, index) => (
          <div
            key={index}
            className={`heatmap-cell h-4 w-4 rounded-sm intensity-${cell.intensity} cursor-pointer`}
            title={getTooltipContent(cell)}
          />
        ))}
      </div>
      
      <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
        <span>60 min ago</span>
        <div className="flex items-center space-x-1">
          <span>Less</span>
          <div className="flex space-x-1">
            <div className="w-3 h-3 rounded-sm heatmap-cell intensity-0" />
            <div className="w-3 h-3 rounded-sm heatmap-cell intensity-1" />
            <div className="w-3 h-3 rounded-sm heatmap-cell intensity-2" />
            <div className="w-3 h-3 rounded-sm heatmap-cell intensity-3" />
          </div>
          <span>More</span>
        </div>
        <span>Now</span>
      </div>
    </div>
  );
};

export default ActivityHeatMap;