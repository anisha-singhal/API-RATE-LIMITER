import { useMemo } from "react";

const CELL_SIZE = 14; // px
const GAP = 6; // px

const ActivityHeatMap = ({ data = [] }) => {
  // Ensure we have exactly 60 data points for the last hour, oldest -> newest
  const processedData = useMemo(() => {
    const base = Array.from({ length: 60 }, (_, i) => ({ requests: 0, intensity: 0, timestamp: Date.now() - (59 - i) * 60 * 1000 }));
    return base.map((slot, i) => ({ ...slot, ...(data[i] || {}) }));
  }, [data]);

  // Split into two rows (top: 60-31 mins ago, bottom: 30 mins ago -> now)
  const topRow = processedData.slice(0, 30);
  const bottomRow = processedData.slice(30, 60);
  
  const getTooltipContent = (cell) => {
    if (!cell) return '';
    const d = new Date(cell.timestamp);
    const label = isNaN(d.getTime())
      ? 'Unknown time'
      : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${label}: ${cell.requests || 0} requests`;
  };
  
  const getIntensityClass = (cell) => {
    if (typeof cell?.intensity === 'number') return `intensity-${cell.intensity}`;
    const r = cell?.requests || 0;
    if (r === 0) return 'intensity-0';
    if (r <= 2) return 'intensity-1';
    if (r <= 5) return 'intensity-2';
    return 'intensity-3';
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

      {/* Mobile: single-row, horizontally scrollable */}
      <div className="md:hidden overflow-x-auto pb-1">
        <div
          className="inline-grid"
          style={{ gridTemplateColumns: `repeat(60, 12px)`, gap: `4px` }}
        >
          {processedData.map((cell, index) => (
            <div
              key={`m-${index}`}
              className={`heatmap-cell rounded-[3px] ${getIntensityClass(cell)}`}
              style={{ width: 12, height: 12 }}
              title={getTooltipContent(cell)}
            />
          ))}
        </div>
      </div>

      {/* md+ : Two-row heatmap: matches the provided design */}
      <div className="hidden md:block">
        <div className="space-y-2">
          <div
            className="inline-grid"
            style={{ gridTemplateColumns: `repeat(30, ${CELL_SIZE}px)`, gap: `${GAP}px` }}
          >
            {topRow.map((cell, index) => (
              <div
                key={`top-${index}`}
                className={`heatmap-cell rounded-[3px] ${getIntensityClass(cell)}`}
                style={{ width: CELL_SIZE, height: CELL_SIZE }}
                title={getTooltipContent(cell)}
              />
            ))}
          </div>
          <div
            className="inline-grid"
            style={{ gridTemplateColumns: `repeat(30, ${CELL_SIZE}px)`, gap: `${GAP}px` }}
          >
            {bottomRow.map((cell, index) => (
              <div
                key={`bottom-${index}`}
                className={`heatmap-cell rounded-[3px] ${getIntensityClass(cell)}`}
                style={{ width: CELL_SIZE, height: CELL_SIZE }}
                title={getTooltipContent(cell)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
        <span>60 min ago</span>
        <div className="flex items-center space-x-2">
          <span>Less</span>
          <div className="flex items-center space-x-1">
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
