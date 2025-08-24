import { useState } from 'react';
import AdvancedEventLog from '@/components/AdvancedEventLog';
import ActivityHeatMap from '@/components/ActivityHeatMap';
import ControlPanel from '@/components/ControlPanel';
import EnhancedHeader from '@/components/EnhancedHeader';
import InteractiveChart from '@/components/InteractiveChart';
import SmartStatCards from '@/components/SmartStatCards';
import { Toaster } from "@/components/ui/toaster"; // Required for shadcn/ui notifications

function App() {
  // We will wire up all this logic in the next step to make the dashboard interactive
  const [filterTimestamp, setFilterTimestamp] = useState(null);

  const handleDataPointClick = (timestamp) => {
    console.log("Chart clicked at timestamp:", timestamp);
    setFilterTimestamp(timestamp);
  };

  return (
    // Note: You may need to adjust your main CSS/HTML for the dark theme
    // if you see a white background. Add `className="dark"` to your <html> tag in index.html.
    <div className="bg-background text-foreground min-h-screen">
      <EnhancedHeader />

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
      
      {/* This component is required for the shadcn/ui toast notifications to appear */}
      <Toaster />
    </div>
  );
}

export default App; 