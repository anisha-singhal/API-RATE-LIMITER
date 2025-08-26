import { useState, useEffect } from "react";

const ActivityHeatMap = ({ data = [] }) => {
  const getTooltipContent = (cell, index) => {
    if (!cell) return '';
    const secondsAgo = 119 - index; // The array has 120 items
    if (secondsAgo === 0) {
      return `Now: ${cell.requests || 0} requests`;
    }
    return `${secondsAgo}s ago: ${cell.requests || 0} requests`;
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
      
      <div className="flex flex-wrap gap-1.5">
        {data.map((cell, index) => (
          <div
            key={index}
            className={`heatmap-cell h-4 w-4 rounded-sm intensity-${cell.intensity} cursor-pointer`}
            title={getTooltipContent(cell, index)}
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