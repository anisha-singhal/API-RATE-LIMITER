import { useState, useEffect } from "react";
import { Calendar, ChevronDown, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CommandPalette from "./CommandPalette";

const EnhancedHeader = ({
  activeRange,
  onDateRangeChange,
  onFilterErrors,
  onToggleSimulation,
  onRefreshData,
}) => {
  const [selectedRange, setSelectedRange] = useState(activeRange?.label || "Last 60 mins");

  // Sync with parent when prop changes
  useEffect(() => {
    if (activeRange?.label) setSelectedRange(activeRange.label);
  }, [activeRange]);

  // Keep local label in sync with App state
  // This ensures switching filters elsewhere won't desync the header
  // and prevents data-loss bugs from mismatched types
  
  const dateRanges = [
    { label: "Last 60 mins", value: "60m" },
    { label: "Last 24h", value: "24h" },
    { label: "Last 7 days", value: "7d" },
    { label: "Last 30 days", value: "30d" },
  ];

  const handleRangeChange = (rangeObj) => {
    setSelectedRange(rangeObj.label);
    onDateRangeChange?.(rangeObj);
  };

  return (
    <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">
                API Command Center
              </h1>
            </div>
            <div className="hidden sm:block w-px h-6 bg-border/50" />
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-muted-foreground">API Operational</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">{selectedRange}</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-[var(--radix-dropdown-menu-trigger-width)] bg-gray-900/80 ..."
              >
                {dateRanges.map((range) => (
                  <DropdownMenuItem
                    key={range.value}
                    onClick={() => handleRangeChange(range)}
                    className={`text-gray-300 rounded-md px-2 py-1.5 cursor-pointer focus:bg-blue-500/20 focus:text-white ${
                      selectedRange === range.label ? "bg-blue-500/10 font-semibold" : ""
                    }`}
                  >
                    {range.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="hidden lg:block">
              <CommandPalette
                onFilterErrors={onFilterErrors}
                onToggleSimulation={onToggleSimulation}
                onRefreshData={onRefreshData}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default EnhancedHeader;