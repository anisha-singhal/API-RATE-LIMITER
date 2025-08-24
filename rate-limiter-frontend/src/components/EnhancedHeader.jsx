import { useState } from "react";
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
  onDateRangeChange,
  onFilterErrors,
  onToggleSimulation,
  onRefreshData,
}) => {
  const [selectedRange, setSelectedRange] = useState("Last 60 mins");

  const dateRanges = [
    "Last 60 mins",
    "Last 24h",
    "Last 7 days",
    "Last 30 days"
  ];

  const handleRangeChange = (range) => {
    setSelectedRange(range);
    onDateRangeChange(range);
  };

  return (
    <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
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
                    key={range}
                    onClick={() => handleRangeChange(range)}
                    className={`text-gray-300 rounded-md px-2 py-1.5 cursor-pointer focus:bg-blue-500/20 focus:text-white ${
                      selectedRange === range ? "bg-blue-500/10 font-semibold" : ""
                    }`}
                  >
                    {range}
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