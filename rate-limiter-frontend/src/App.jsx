import { useState, useEffect } from 'react';
import axios from 'axios';
import EnhancedHeader from '@/components/EnhancedHeader';
import SmartStatCards from '@/components/SmartStatCards';
import InteractiveChart from '@/components/InteractiveChart';
import ActivityHeatMap from '@/components/ActivityHeatMap';
import ControlPanel from '@/components/ControlPanel';
import AdvancedEventLog from '@/components/AdvancedEventLog';
import { Toaster } from "@/components/ui/toaster";

function App() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    tokensRemaining: 10,
    bucketCapacity: 10,
    refillRate: '2/sec',
    blocked24h: 1421, 
  });

  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    let intervalId = null;

    if (isSimulating) {
      intervalId = setInterval(() => {
        makeApiRequest();
      }, 1000); 
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isSimulating]);

  const handleToggleSimulation = () => {
    setIsSimulating(prevState => !prevState);
  };
  
  const makeApiRequest = async () => {
    try {
      // GET request to backend server
      const response = await axios.get('http://localhost:8000/api/data');

      // Extract data from the successful response
      const remainingTokens = parseFloat(response.headers['x-ratelimit-remaining']);
      const newLog = {
        id: Math.random().toString(36).substring(7),
        timestamp: new Date(),
        status: 'success',
        method: 'GET',
        path: '/api/data',
        latency: 50, 
      };

      // Update the state
      setStats(prevStats => ({ ...prevStats, tokensRemaining: remainingTokens }));
      setLogs(prevLogs => [newLog, ...prevLogs]);

    } catch (error) {
      if (error.response && error.response.status === 429) {
        const remainingTokens = parseFloat(error.response.headers['x-ratelimit-remaining']);
        const newLog = {
          id: Math.random().toString(36).substring(7),
          timestamp: new Date(),
          status: 'blocked',
          method: 'GET',
          path: '/api/data',
          latency: 25,
        };
        
        // Update the state
        setStats(prevStats => ({ ...prevStats, tokensRemaining: remainingTokens }));
        setLogs(prevLogs => [newLog, ...prevLogs]);
      } else {
        console.error("An unexpected error occurred:", error);
      }
    }
  };

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen">
      <EnhancedHeader />

      <main className="container mx-auto px-6 py-8">
        {/* Pass the live stats down to the component */}
        <SmartStatCards stats={stats} />
        
        <div className="mt-8">
          <InteractiveChart onDataPointClick={() => {}} />
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
             <ActivityHeatMap />
          </div>
          <div className="lg:col-span-2">
            {/* Pass the API call function down to the component */}
            <ControlPanel onSendRequest={makeApiRequest} />
          </div>
        </div>
        
        <div className="mt-8">
          {/* Pass the live logs down to the component */}
          <AdvancedEventLog logs={logs} />
        </div>
      </main>
      
      <Toaster />
    </div>
  );
}

export default App;