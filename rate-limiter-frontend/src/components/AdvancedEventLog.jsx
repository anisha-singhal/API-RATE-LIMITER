import React from 'react';
import { useState, useMemo } from "react";
import { Search, ChevronDown, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const AdvancedEventLog = ({ logs = [], filterTimestamp }) => {
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedRows, setExpandedRows] = useState(new Set());

  const parsedLogs = useMemo(() => {
    if (!logs) return [];
    return logs.map(log => ({
      ...log,
      timestamp: typeof log.timestamp === 'string' ? new Date(log.timestamp) : log.timestamp
    }));
  }, [logs]);

  const filteredLogs = useMemo(() => {
    let filtered = [...parsedLogs]; 
    if (filterTimestamp) {
      filtered = filtered.filter(log => Math.abs(log.timestamp.getTime() - filterTimestamp) < 5000);
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter(log => log.status === statusFilter);
    }
    if (filter.trim()) {
      const lowercasedFilter = filter.toLowerCase();
      filtered = filtered.filter(log => 
        log.path.toLowerCase().includes(lowercasedFilter) || 
        log.method.toLowerCase().includes(lowercasedFilter) || 
        log.status.toLowerCase().includes(lowercasedFilter)
      );
    }
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return filtered;
  }, [parsedLogs, filter, statusFilter, filterTimestamp]); 

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
      <div className="mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between md:mb-2">
          <h2 className="text-lg font-semibold text-white mb-3 md:mb-0">Advanced Event Log</h2>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <Input
                placeholder="Filter logs..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-9 w-full md:w-64 bg-gray-900 border-gray-700"
              />
            </div>
            {/* Desktop filter buttons */}
            <div className="hidden md:flex items-center gap-2">
              <Button variant={statusFilter === "all" ? "secondary" : "outline"} size="sm" onClick={() => setStatusFilter("all")}>All</Button>
              <Button variant={statusFilter === "success" ? "secondary" : "outline"} size="sm" onClick={() => setStatusFilter("success")}>Success</Button>
              <Button variant={statusFilter === "blocked" ? "secondary" : "outline"} size="sm" onClick={() => setStatusFilter("blocked")}>Blocked</Button>
            </div>
          </div>
        </div>
        {/* Mobile quick filter chips */}
        <div className="mt-3 flex md:hidden items-center gap-2">
          <Button variant={statusFilter === "all" ? "secondary" : "outline"} size="sm" onClick={() => setStatusFilter("all")}>All</Button>
          <Button variant={statusFilter === "success" ? "secondary" : "outline"} size="sm" onClick={() => setStatusFilter("success")}>Success</Button>
          <Button variant={statusFilter === "blocked" ? "secondary" : "outline"} size="sm" onClick={() => setStatusFilter("blocked")}>Blocked</Button>
        </div>
      </div>

      <div className="overflow-x-auto h-96">
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
              return (
                // React.Fragment to group the two rows
                <React.Fragment key={log.id}>
                  {/* This is the main, clickable row */}
                  <tr 
                    onClick={() => toggleRowExpansion(log.id)}
                    className="border-b border-gray-800 hover:bg-gray-700/50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4"><div className="flex items-center"><Clock className="w-3 h-3 mr-2 text-gray-500" />{log.timestamp.toLocaleTimeString()}</div></td>
                    <td className="py-3 px-4">{getStatusBadge(log.status)}</td>
                    <td className="py-3 px-4 font-mono">{log.method}</td>
                    <td className="py-3 px-4 text-gray-400 font-mono">{log.path}</td>
                    <td className="py-3 px-4 text-right">{log.latency}ms</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center">
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </div>
                    </td>
                  </tr>
                  
                  {/* This is the content row that shows only when expanded */}
                  {isExpanded && (
                    <tr className="bg-gray-900/70">
                      <td colSpan={6} className="p-4">
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
                          <div className="flex justify-between"><span className="text-gray-500">IP Address:</span><span className="font-mono">{log.ip}</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Response Size:</span><span>{log.responseSize} bytes</span></div>
                          <div className="flex justify-between col-span-2"><span className="text-gray-500">User Agent:</span><span className="font-mono truncate">{log.userAgent}</span></div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdvancedEventLog;