import { useState, useEffect, useMemo } from "react";
import { Search, ChevronDown, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const AdvancedEventLog = ({ filterTimestamp }) => {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [animatingRows, setAnimatingRows] = useState(new Set());

  // Note: This function generates fake data for demonstration.
  // We will replace this later with real data from our API.
  const generateLogEntry = () => {
    const methods = ["GET", "POST", "PUT", "DELETE"];
    const paths = ["/api/users", "/api/data", "/api/auth", "/api/orders"];
    const isBlocked = Math.random() < 0.2;
    
    return {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
      status: isBlocked ? "blocked" : "success",
      method: methods[Math.floor(Math.random() * methods.length)],
      path: paths[Math.floor(Math.random() * paths.length)],
      latency: Math.floor(Math.random() * 500) + 20,
      ip: "192.168.1.1",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      responseSize: isBlocked ? 0 : Math.floor(Math.random() * 10000) + 500,
    };
  };

  useEffect(() => {
    const initialLogs = Array.from({ length: 20 }, generateLogEntry);
    setLogs(initialLogs);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const newLog = generateLogEntry();
      setAnimatingRows(prev => new Set([...prev, newLog.id]));
      setTimeout(() => {
        setAnimatingRows(prev => {
          const newSet = new Set(prev);
          newSet.delete(newLog.id);
          return newSet;
        });
      }, 1000);
      setLogs(prevLogs => [newLog, ...prevLogs.slice(0, 99)]);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const parseFilter = (filterStr) => {
    const filters = {};
    const parts = filterStr.split(" AND ");
    parts.forEach(part => {
      const [key, value] = part.split(":");
      if (key && value) {
        filters[key.trim()] = value.trim();
      } else {
        filters.general = part.trim();
      }
    });
    return filters;
  };

  const filteredLogs = useMemo(() => {
    let filtered = logs;
    if (filterTimestamp) {
      filtered = filtered.filter(log => Math.abs(log.timestamp.getTime() - filterTimestamp) < 5000);
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter(log => log.status === statusFilter);
    }
    if (filter.trim()) {
      const parsedFilters = parseFilter(filter);
      filtered = filtered.filter(log => {
        return Object.entries(parsedFilters).every(([key, value]) => {
          // This is a simplified filter for the demo
          return (
            log.path.toLowerCase().includes(value.toLowerCase()) ||
            log.method.toLowerCase().includes(value.toLowerCase()) ||
            log.status.toLowerCase().includes(value.toLowerCase())
          );
        });
      });
    }
    return filtered;
  }, [logs, filter, statusFilter, filterTimestamp]);

  const toggleRowExpansion = (id) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getStatusBadge = (status) => {
    if (status === "success") {
      return <Badge className="bg-green-500/10 text-green-400 border-green-500/20">200 OK</Badge>;
    }
    return <Badge className="bg-red-500/10 text-red-400 border-red-500/20">429 Blocked</Badge>;
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 mb-8 border border-gray-700 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Advanced Event Log</h2>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <Input
              placeholder="Filter logs..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-9 w-64 bg-gray-900 border-gray-700"
            />
          </div>
          <Button variant={statusFilter === "all" ? "secondary" : "outline"} size="sm" onClick={() => setStatusFilter("all")}>All</Button>
          <Button variant={statusFilter === "success" ? "secondary" : "outline"} size="sm" onClick={() => setStatusFilter("success")}>Success</Button>
          <Button variant={statusFilter === "blocked" ? "secondary" : "outline"} size="sm" onClick={() => setStatusFilter("blocked")}>Blocked</Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 font-medium text-gray-400">Timestamp</th>
              <th className="text-left py-3 px-4 font-medium text-gray-400">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-400">Method</th>
              <th className="text-left py-3 px-4 font-medium text-gray-400">Path</th>
              <th className="text-right py-3 px-4 font-medium text-gray-400">Latency</th>
              <th className="text-center py-3 px-4 font-medium text-gray-400">Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => {
              const isExpanded = expandedRows.has(log.id);
              const isAnimating = animatingRows.has(log.id);
              return (
                <Collapsible key={log.id} asChild open={isExpanded} onOpenChange={() => toggleRowExpansion(log.id)}>
                  <>
                    <CollapsibleTrigger asChild>
                      <tr className={`border-b border-gray-800 hover:bg-gray-700/50 transition-colors cursor-pointer ${isAnimating ? 'animate-pulse' : ''}`}>
                        <td className="py-3 px-4"><div className="flex items-center"><Clock className="w-3 h-3 mr-2 text-gray-500" />{log.timestamp.toLocaleTimeString()}</div></td>
                        <td className="py-3 px-4">{getStatusBadge(log.status)}</td>
                        <td className="py-3 px-4 font-mono">{log.method}</td>
                        <td className="py-3 px-4 text-gray-400 font-mono">{log.path}</td>
                        <td className="py-3 px-4 text-right">{log.latency}ms</td>
                        <td className="py-3 px-4"><div className="flex justify-center"><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? "rotate-180" : ""}`} /></div></td>
                      </tr>
                    </CollapsibleTrigger>
                    <CollapsibleContent asChild>
                      <tr className="bg-gray-900/70">
                        <td colSpan={6} className="p-4">
                          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
                            <div className="flex justify-between"><span className="text-gray-500">IP Address:</span><span className="font-mono">{log.ip}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Response Size:</span><span>{log.responseSize} bytes</span></div>
                            <div className="flex justify-between col-span-2"><span className="text-gray-500">User Agent:</span><span className="font-mono truncate">{log.userAgent}</span></div>
                          </div>
                        </td>
                      </tr>
                    </CollapsibleContent>
                  </>
                </Collapsible>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdvancedEventLog;