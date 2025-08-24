import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Coins, Database, RefreshCw, Shield } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

const SmartStatCards = () => {
  // Later, we will replace this with real data from our API.
  const [stats, setStats] = useState([
    {
      id: "tokens",
      title: "Tokens Remaining",
      value: "8 / 10",
      change: -12.5,
      trend: "down",
      sparklineData: Array.from({ length: 10 }, (_, i) => ({ value: 10 - i * 0.2 })),
      icon: Coins,
      color: "#3B82F6", // Blue
    },
    {
      id: "capacity",
      title: "Bucket Capacity",
      value: "10",
      change: 0,
      trend: "neutral",
      sparklineData: Array.from({ length: 10 }, () => ({ value: 10 })),
      icon: Database,
      color: "#A855F7", // Purple
    },
    {
      id: "refill",
      title: "Refill Rate",
      value: "2/sec",
      change: 5.2,
      trend: "up",
      sparklineData: Array.from({ length: 10 }, (_, i) => ({ value: 2 + Math.sin(i) * 0.3 })),
      icon: RefreshCw,
      color: "#10B981", // Green
    },
    {
      id: "blocked",
      title: "Blocked (24h)",
      value: "1,421",
      change: -8.1,
      trend: "down",
      sparklineData: Array.from({ length: 10 }, (_, i) => ({ value: 1500 - i * 8 })),
      icon: Shield,
      color: "#EF4444", // Red
    },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prevStats) =>
        prevStats.map((stat) => {
          if (stat.id !== "tokens") return stat; // Only update tokens for this demo
          const newTokens = Math.max(0, parseFloat(stat.value) - 1);
          return {
            ...stat,
            value: `${newTokens} / 10`,
            change: ((newTokens - 9) / 9) * 100,
          };
        })
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);


  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case "up":
        return "text-green-500";
      case "down":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-400">{stat.title}</h3>
              <Icon className="w-5 h-5 text-gray-500" />
            </div>

            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className={`flex items-center space-x-1 text-sm ${getTrendColor(stat.trend)}`}>
                  {getTrendIcon(stat.trend)}
                  <span>{stat.change}%</span>
                </div>
              </div>
              <div className="w-20 h-10">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stat.sparklineData}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={stat.color}
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