import { useState, useEffect, useMemo } from 'react';
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
      if (Array.isArray(parsed)) {
          return parsed.map(item => ({...item, timestamp: new Date(item.timestamp)}));
      }
    }
  } catch (error) {
    console.error(`Error reading from localStorage for key "${key}":`, error);
  }
  return defaultValue;
};

const timeRanges = {
    '60m': 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
};

function App() {
  const [activeDateRange, setActiveDateRange] = useState({ label: 'Last 60 mins', value: '60m' });
  
  const [allLogs, setAllLogs] = useState(() => getInitialState('allLogs', []));
  const [allChartData, setAllChartData] = useState(() => getInitialState('allChartData', []));
  const [heatMapData, setHeatMapData] = useState(() => getInitialState('heatMapData', Array.from({ length: 120 }, () => ({ requests: 0, intensity: 0 }))));

  const [stats, setStats] = useState({
    tokensRemaining: 10,
    bucketCapacity: 10,
    refillRate: '2/sec',
    blocked24h: 0,
  });
  const [isSimulating, setIsSimulating] = useState(false);
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

  useEffect(() => {
    localStorage.setItem('allLogs', JSON.stringify(allLogs));
    localStorage.setItem('allChartData', JSON.stringify(allChartData));
    localStorage.setItem('heatMapData', JSON.stringify(heatMapData));
  }, [allLogs, allChartData, heatMapData]);

  useEffect(() => {
    let intervalId = null;
    if (isSimulating) {
      intervalId = setInterval(() => { makeApiRequest(); }, 700);
    }
    return () => clearInterval(intervalId);
  }, [isSimulating]);

  const handleToggleSimulation = () => setIsSimulating(prevState => !prevState);

  const handleDateRangeChange = (range) => {
    setActiveDateRange(range); 
    toast({ title: "View Updated", description: `Displaying data for ${range.label}.` });
  };

  const makeApiRequest = async () => {
    const newLog = { 
        id: Math.random().toString(36).substring(7), 
        timestamp: new Date(),
    };
    try {
      const response = await axios.get(`${API_BASE_URL}/api/data`);
      const { headers } = response;
      newLog.status = 'success';
      setStats(prev => ({ ...prev, tokensRemaining: parseFloat(headers['x-ratelimit-remaining']) }));
    } catch (error) {
      if (error.response && error.response.status === 429) {
          newLog.status = 'blocked';
          setStats(prev => ({ ...prev, tokensRemaining: 0, blocked24h: prev.blocked24h + 1 }));
      } else {
          console.error("API Error", error);
          toast({ title: "API Error", description: "The backend is not responding.", variant: "destructive"});
          return;
      }
    }
    
    setAllLogs(prev => [newLog, ...prev]);
    
    setAllChartData(prevData => {
        const now = new Date();
        const currentTimeSlot = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes()).getTime();
        const newData = [...prevData];
        const lastPoint = newData[newData.length - 1];

        if (lastPoint && lastPoint.timestamp === currentTimeSlot) {
            const updatedPoint = { ...lastPoint };

            if (newLog.status === 'success') updatedPoint.successful += 1;
            if (newLog.status === 'blocked') updatedPoint.blocked += 1;
            
            newData[newData.length - 1] = updatedPoint;
        } else {
            newData.push({
                timestamp: currentTimeSlot,
                time: new Date(currentTimeSlot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                successful: newLog.status === 'success' ? 1 : 0,
                blocked: newLog.status === 'blocked' ? 1 : 0,
            });
        }
        return newData;
    });

    setHeatMapData(currentHeatMap => {
        const newHeatMap = [...currentHeatMap];
        const targetIndex = Math.floor(Math.random() * newHeatMap.length);
        const targetBlock = { ...newHeatMap[targetIndex] };
        targetBlock.requests = (targetBlock.requests || 0) + 1;
        if (targetBlock.requests > 5) targetBlock.intensity = 3;
        else if (targetBlock.requests > 2) targetBlock.intensity = 2;
        else targetBlock.intensity = 1;
        newHeatMap[targetIndex] = targetBlock;
        return newHeatMap;
    });
  };

  const handleUpdateConfig = async (config) => {
    try {
      await axios.post(`${API_BASE_URL}/api/config`, config);
      toast({
        title: "Configuration Updated",
        description: `Bucket size set to ${config.bucketSize}, refill rate to ${config.refillRate}/sec.`,
      });
      const response = await axios.get(`${API_BASE_URL}/api/config`);
      const { bucketSize, refillRate } = response.data;
      setStats(prev => ({ ...prev, bucketCapacity: bucketSize, refillRate: `${refillRate}/sec`, tokensRemaining: bucketSize }));
    } catch (error) {
      console.error("Failed to update config:", error);
      toast({ title: "Update Failed", description: "Could not apply new configuration.", variant: "destructive" });
    }
  };
  
  const filteredLogs = useMemo(() => {
    if (!allLogs) return [];
    const timeLimit = timeRanges[activeDateRange.value];
    const now = Date.now();
    return allLogs.filter(log => (now - log.timestamp.getTime()) < timeLimit);
  }, [allLogs, activeDateRange]);

  const filteredChartData = useMemo(() => {
    if (!allChartData) return [];
    const timeLimit = timeRanges[activeDateRange.value];
    const now = Date.now();
    return allChartData.filter(point => (now - point.timestamp) < timeLimit);
  }, [allChartData, activeDateRange]);

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen">
      <EnhancedHeader activeRange={activeDateRange} onDateRangeChange={handleDateRangeChange} />
      <main className="container mx-auto px-6 py-8">
        <SmartStatCards stats={stats} />
        <div className="mt-8">
          <InteractiveChart data={filteredChartData} />
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
          <AdvancedEventLog logs={filteredLogs} />
        </div>
      </main>
      <Toaster />
    </div>
  );
}

export default App;