import { useState, useEffect } from 'react';
import axios from 'axios';
import EnhancedHeader from '@/components/EnhancedHeader';
import SmartStatCards from '@/components/SmartStatCards';
import InteractiveChart from '@/components/InteractiveChart';
import ActivityHeatMap from '@/components/ActivityHeatMap';
import ControlPanel from '@/components/ControlPanel';
import AdvancedEventLog from '@/components/AdvancedEventLog';
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const getInitialState = (key, defaultValue) => {
  try {
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
      const parsed = JSON.parse(storedValue);
      if (Array.isArray(parsed) && (key === 'allLogs' || key === 'allChartData')) {
          return parsed.map(item => ({...item, timestamp: new Date(item.timestamp)}));
      }
      return parsed;
    }
  } catch (error) {
    console.error(`Error reading from localStorage for key "${key}":`, error);
  }
  return defaultValue;
};

function App() {
  const [activeDateRange, setActiveDateRange] = useState('60m');

  const [allLogs, setAllLogs] = useState(() => getInitialState('allLogs', []));
  const [allChartData, setAllChartData] = useState(() => getInitialState('allChartData', []));

  const [stats, setStats] = useState({
    tokensRemaining: 10,
    bucketCapacity: 10,
    refillRate: '2/sec',
    blocked24h: 0,
  });
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [heatMapData, setHeatMapData] = useState(Array.from({ length: 120 }, () => ({ requests: 0, intensity: 0 })));
  const { toast } = useToast();

  useEffect(() => {
    const fetchInitialConfig = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/config`);
            const { bucketSize, refillRate } = response.data;
            setStats(prev => ({ ...prev, bucketCapacity: bucketSize, tokensRemaining: bucketSize, refillRate: `${refillRate}/sec` }));
        } catch (error) {
            console.error("Could not fetch initial config", error);
            toast({ title: "Connection Error", description: "Could not sync with the backend.", variant: "destructive" });
        }
    };
    fetchInitialConfig();
  }, [toast]);

  //Save logs and chart data to localStorage whenever they change.
  useEffect(() => {
    try {
      localStorage.setItem('allLogs', JSON.stringify(allLogs));
      localStorage.setItem('allChartData', JSON.stringify(allChartData));
    } catch (error) {
      console.error('Failed to save state to localStorage:', error);
    }
  }, [allLogs, allChartData]);

  useEffect(() => {
    let intervalId = null;
    if (isSimulating) {
      intervalId = setInterval(() => {
        makeApiRequest();
      }, 700);
    }
    return () => clearInterval(intervalId);
  }, [isSimulating, activeDateRange]);

  const handleToggleSimulation = () => setIsSimulating(prevState => !prevState);

  const handleDateRangeChange = (range) => {
    // Note: expects an object like { label: 'Last 60 mins', value: '60m' }
    setActiveDateRange(range.value); 
    toast({
      title: "View Updated",
      description: `Displaying data for ${range.label}.`,
    });
  };

  const makeApiRequest = async () => {
    const updateChart = (status) => {
      setAllChartData(currentAllData => {
        const currentData = currentAllData[activeDateRange] || [];
        const now = new Date();
        const currentTimeSlot = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()).getTime();
        const newData = [...currentData];
        const lastPoint = newData[newData.length - 1];

        if (lastPoint && lastPoint.timestamp === currentTimeSlot) {
          const updatedPoint = { ...lastPoint };
          if (status === 'success') updatedPoint.successful += 1;
          if (status === 'blocked') updatedPoint.blocked += 1;
          newData[newData.length - 1] = updatedPoint;
        } else {
          newData.push({
            timestamp: currentTimeSlot,
            time: new Date(currentTimeSlot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            successful: status === 'success' ? 1 : 0,
            blocked: status === 'blocked' ? 1 : 0,
          });
        }
        
        const finalData = newData.length > 60 ? newData.slice(-60) : newData;
        return { ...currentAllData, [activeDateRange]: finalData };
      });
    };

    const updateHeatMap = () => {
      setHeatMapData(currentHeatMap => {
        const newHeatMap = [...currentHeatMap];
        newHeatMap.shift();
        const requests = Math.floor(Math.random() * 20);
        let intensity = 0;
        if (requests > 15) intensity = 3; else if (requests > 10) intensity = 2; else if (requests > 5) intensity = 1;
        newHeatMap.push({ requests, intensity });
        return newHeatMap;
      });
    };

    try {
      const response = await axios.get(`${API_BASE_URL}/api/data`);
      const { headers } = response;
      const newLog = { id: Math.random().toString(36).substring(7), timestamp: new Date(), status: 'success', method: 'GET', path: '/api/data', latency: Math.floor(Math.random() * (100 - 30) + 30) };
      
      setStats(prevStats => ({ 
        ...prevStats,
        tokensRemaining: parseFloat(headers['x-ratelimit-remaining']),
        bucketCapacity: parseInt(headers['x-ratelimit-limit'], 10),
        refillRate: `${parseInt(headers['x-ratelimit-refill-rate'], 10)}/sec`,
      }));
      setAllLogs(prevLogs => ({ ...prevLogs, [activeDateRange]: [newLog, ...(prevLogs[activeDateRange] || [])] }));
      updateChart('success');
      updateHeatMap();

    } catch (error) {
      if (error.response && error.response.status === 429) {
        const { headers } = error.response;
        const newLog = { id: Math.random().toString(36).substring(7), timestamp: new Date(), status: 'blocked', method: 'GET', path: '/api/data', latency: Math.floor(Math.random() * (40 - 10) + 10) };

        setStats(prevStats => ({ 
          ...prevStats,
          tokensRemaining: parseFloat(headers['x-ratelimit-remaining']),
          bucketCapacity: parseInt(headers['x-ratelimit-limit'], 10),
          refillRate: `${parseInt(headers['x-ratelimit-refill-rate'], 10)}/sec`,
          blocked24h: prevStats.blocked24h + 1,
        }));
        setAllLogs(prevLogs => ({ ...prevLogs, [activeDateRange]: [newLog, ...(prevLogs[activeDateRange] || [])] }));
        updateChart('blocked');
        updateHeatMap();
      } else {
        console.error("An unexpected error occurred:", error);
      }
    }
  };

  const handleUpdateConfig = async (config) => {
    try {
      await axios.post(`${API_BASE_URL}/api/config`, config);
      toast({
        title: "Configuration Updated",
        description: `Bucket size set to ${config.bucketSize}, refill rate to ${config.refillRate}/sec.`,
      });
      makeApiRequest(); // Refresh stats after update
    } catch (error) {
      console.error("Failed to update config:", error);
      toast({ title: "Update Failed", description: "Could not apply the new configuration.", variant: "destructive" });
    }
  };

  const filteredLogs = allLogs; 
  const filteredChartData = allChartData; 

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen">
      <EnhancedHeader onDateRangeChange={handleDateRangeChange} />
      <main className="container mx-auto px-6 py-8">
        <SmartStatCards stats={stats} />
        <div className="mt-8">
          <InteractiveChart data={allChartData[activeDateRange]} onDataPointClick={() => {}} />
        </div>
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
             <ActivityHeatMap data={heatMapData} />
          </div>
          <div className="lg:col-span-2">
            <ControlPanel
              onSendRequest={makeApiRequest}
              isSimulating={isSimulating}
              onToggleSimulation={handleToggleSimulation}
              onUpdateConfig={handleUpdateConfig}
            />
          </div>
        </div>
        <div className="mt-8">
          <AdvancedEventLog logs={allLogs[activeDateRange]} />
        </div>
      </main>
      <Toaster />
    </div>
  );
}

export default App;

