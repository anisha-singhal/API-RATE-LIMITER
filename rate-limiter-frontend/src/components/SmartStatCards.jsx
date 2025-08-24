import { TrendingUp, TrendingDown, Coins, Database, RefreshCw, Shield } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

const SmartStatCards = ({ stats }) => {

  const getTrendIcon = (change) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return null; // Don't show an icon if change is zero
  };

  const getTrendColor = (change) => {
    if (change > 0) return "text-green-500";
    if (change < 0) return "text-red-500";
    return "text-gray-500";
  };
  
  // We create the card data based on the 'stats' prop passed from App.jsx
  const cards = [
    {
      id: "tokens",
      title: "Tokens Remaining",
      value: `${Math.floor(stats.tokensRemaining)} / ${stats.bucketCapacity}`,
      change: -12.5, // Note: 'change' and 'sparklineData' are placeholders for now
      sparklineData: Array.from({ length: 10 }, (_, i) => ({ value: 10 - i * 0.2 })),
      icon: Coins,
      color: "#3B82F6", // Blue
    },
    {
      id: "capacity",
      title: "Bucket Capacity",
      value: stats.bucketCapacity,
      change: 0,
      sparklineData: Array.from({ length: 10 }, () => ({ value: 10 })),
      icon: Database,
      color: "#A855F7", // Purple
    },
    {
      id: "refill",
      title: "Refill Rate",
      value: stats.refillRate,
      change: 0,
      sparklineData: Array.from({ length: 10 }, () => ({ value: 2 })),
      icon: RefreshCw,
      color: "#10B981", // Green
    },
    {
      id: "blocked",
      title: "Blocked (24h)",
      value: stats.blocked24h,
      change: -8.1,
      sparklineData: Array.from({ length: 10 }, (_, i) => ({ value: 1500 - i * 8 })),
      icon: Shield,
      color: "#EF4444", // Red
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {/* This should map over 'cards', not 'stats' */}
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-400">{card.title}</h3>
              <Icon className="w-5 h-5 text-gray-500" />
            </div>

            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold text-white">{card.value}</div>
                {/* This section now correctly uses the 'change' value */}
                <div className={`flex items-center space-x-1 text-sm ${getTrendColor(card.change)}`}>
                  {getTrendIcon(card.change)}
                  {card.change !== 0 && <span>{card.change}%</span>}
                </div>
              </div>
              <div className="w-20 h-10">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={card.sparklineData}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={card.color}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SmartStatCards;