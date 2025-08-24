import { useState } from 'react';
import axios from 'axios';
import EnhancedHeader from '@/components/EnhancedHeader';
import SmartStatCards from '@/components/SmartStatCards';
import InteractiveChart from '@/components/InteractiveChart';
import ActivityHeatMap from '@/components/ActivityHeatMap';
import ControlPanel from '@/components/ControlPanel';
import AdvancedEventLog from '@/components/AdvancedEventLog';
import { Toaster } from "@/components/ui/toaster";

function App() {
  const [filterTimestamp, setFilterTimestamp] = useState(null);
  // --- ADD THIS STATE ---
  const [dateRange, setDateRange] = useState('Last 60 mins');

  const handleDataPointClick = (timestamp) => {
    console.log("Chart clicked at timestamp:", timestamp);
    setFilterTimestamp(timestamp);
  };

  // --- ADD THIS HANDLER FUNCTION ---
  const handleDateRangeChange = (newRange) => {
    console.log("New date range selected:", newRange);
    setDateRange(newRange);
    // In a real application, you would trigger a new API call here
    // to fetch data for the new date range.
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* --- UPDATE THIS LINE --- */}
      <EnhancedHeader onDateRangeChange={handleDateRangeChange} />

      <main className="container mx-auto px-6 py-8">
        <SmartStatCards />
        
        <div className="mt-8">
          <InteractiveChart onDataPointClick={handleDataPointClick} />
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
             <ActivityHeatMap />
          </div>
          <div className="lg:col-span-2">
            <ControlPanel />
          </div>
        </div>
        
        <div className="mt-8">
          <AdvancedEventLog filterTimestamp={filterTimestamp} />
        </div>
      </main>
      
      <Toaster />
    </div>
  );
}

export default App;