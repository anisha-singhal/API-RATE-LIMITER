import { useState, useEffect, useMemo, useRef } from 'react';
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
        // Only convert timestamps to Date objects for logs
        if (key === 'allLogs') {
          return parsed.map(item => ({ ...item, timestamp: new Date(item.timestamp) }));
        }
        // For chart and heat map data, keep numeric timestamps
        return parsed;
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
  const [heatMapData, setHeatMapData] = useState(() => {
    const initialData = getInitialState('heatMapData', null);
    if (initialData && Array.isArray(initialData) && initialData.length === 60) {
      return initialData;
    }
    // Create 60 time slots for the last hour (minute by minute)
    const now = new Date();
    return Array.from({ length: 60 }, (_, index) => {
      const timestamp = new Date(now.getTime() - (59 - index) * 60 * 1000);
      return {
        timestamp: timestamp.getTime(),
        minute: timestamp.getMinutes(),
        hour: timestamp.getHours(),
        requests: 0,
        intensity: 0,
        minutesAgo: 59 - index
      };
    });
  });

  const [stats, setStats] = useState({
    tokensRemaining: 10,
    bucketCapacity: 10,
    refillRate: '2/sec',
    blocked24h: 0,
  });
  const [isSimulating, setIsSimulating] = useState(false);
  const simulationTimersRef = useRef([]);
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

  // Store data in localStorage but only periodically to avoid performance issues
  useEffect(() => {
    const saveToStorage = () => {
      try {
        localStorage.setItem('allLogs', JSON.stringify(allLogs));
        localStorage.setItem('allChartData', JSON.stringify(allChartData));
        localStorage.setItem('heatMapData', JSON.stringify(heatMapData));
      } catch (error) {
        console.warn('Failed to save to localStorage:', error);
      }
    };
    
    const debounceTimer = setTimeout(saveToStorage, 1000);
    return () => clearTimeout(debounceTimer);
  }, [allLogs, allChartData, heatMapData]);

  // Clear all scheduled simulation timeouts
  const clearSimulationTimers = () => {
    simulationTimersRef.current.forEach((id) => clearTimeout(id));
    simulationTimersRef.current = [];
  };

  useEffect(() => {
    // Whenever the toggle changes, clear any pending timers first
    clearSimulationTimers();

    if (isSimulating) {
      // More realistic traffic simulation with bursts and variable pacing
      const scheduleNextRequest = () => {
        if (!isSimulating) return;

        const baseInterval = 400;
        const randomVariation = Math.random() * 800;
        const interval = baseInterval + randomVariation;

        const id = setTimeout(() => {
          if (!isSimulating) return;

          // 30% chance of creating a burst of requests
          if (Math.random() < 0.3) {
            const burstSize = Math.floor(Math.random() * 4) + 1; // 1-4 requests
            for (let i = 0; i < burstSize; i++) {
              const bid = setTimeout(() => makeApiRequest(), i * 100);
              simulationTimersRef.current.push(bid);
            }
          } else {
            makeApiRequest();
          }

          scheduleNextRequest();
        }, interval);

        simulationTimersRef.current.push(id);
      };

      scheduleNextRequest();
    }

    return () => {
      clearSimulationTimers();
    };
  }, [isSimulating]);
  
  // Update heat map structure every minute to maintain accurate time windows
  useEffect(() => {
    const updateHeatMapStructure = () => {
      setHeatMapData(currentHeatMap => {
        const now = new Date();
        return Array.from({ length: 60 }, (_, index) => {
          const slotTime = new Date(now.getTime() - (59 - index) * 60 * 1000);
          const existingSlot = currentHeatMap.find(slot => 
            slot && Math.abs(slot.timestamp - slotTime.getTime()) < 30000 // 30 second tolerance
          );
          
          return {
            timestamp: slotTime.getTime(),
            minute: slotTime.getMinutes(),
            hour: slotTime.getHours(),
            requests: existingSlot?.requests || 0,
            intensity: existingSlot?.intensity || 0,
            minutesAgo: 59 - index
          };
        });
      });
    };
    
    // Update every 60 seconds
    const structureInterval = setInterval(updateHeatMapStructure, 60000);
    
    return () => clearInterval(structureInterval);
  }, []);

  const handleToggleSimulation = () => setIsSimulating(prevState => !prevState);

  const handleDateRangeChange = (range) => {
    // Defensive: accept both string and object inputs
    if (typeof range === 'string') {
      const map = {
        'Last 60 mins': { label: 'Last 60 mins', value: '60m' },
        'Last 24h': { label: 'Last 24h', value: '24h' },
        'Last 7 days': { label: 'Last 7 days', value: '7d' },
        'Last 30 days': { label: 'Last 30 days', value: '30d' },
      };
      range = map[range] || { label: 'Last 60 mins', value: '60m' };
    }
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
        // Per-second granularity to create visible variation
        const currentTimeSlot = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          now.getHours(),
          now.getMinutes(),
          now.getSeconds()
        ).getTime();
        let newData = [...prevData];
        const lastPoint = newData[newData.length - 1];

        if (lastPoint && lastPoint.timestamp === currentTimeSlot) {
            const updatedPoint = { ...lastPoint };

            if (newLog.status === 'success') updatedPoint.successful += 1;
            if (newLog.status === 'blocked') updatedPoint.blocked += 1;
            
            newData[newData.length - 1] = updatedPoint;
        } else {
            newData.push({
                timestamp: currentTimeSlot,
                time: new Date(currentTimeSlot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                successful: newLog.status === 'success' ? 1 : 0,
                blocked: newLog.status === 'blocked' ? 1 : 0,
            });
        }
        
        // Keep only last 30 days of data to prevent memory issues
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        newData = newData.filter(point => point.timestamp > thirtyDaysAgo);
        
        return newData;
    });

    setHeatMapData(currentHeatMap => {
        const newHeatMap = [...currentHeatMap];
        const now = new Date();
        const currentMinute = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());
        
        // Update the heat map to reflect current time structure
        const updatedHeatMap = newHeatMap.map((slot, index) => {
          const slotTime = new Date(now.getTime() - (59 - index) * 60 * 1000);
          const slotMinute = new Date(slotTime.getFullYear(), slotTime.getMonth(), slotTime.getDate(), slotTime.getHours(), slotTime.getMinutes());
          
          return {
            ...slot,
            timestamp: slotTime.getTime(),
            minute: slotTime.getMinutes(),
            hour: slotTime.getHours(),
            minutesAgo: 59 - index
          };
        });
        
        // Find the current minute slot and increment its request count
        const currentSlotIndex = 59; // Current time is always the last slot (index 59)
        if (updatedHeatMap[currentSlotIndex]) {
          updatedHeatMap[currentSlotIndex] = {
            ...updatedHeatMap[currentSlotIndex],
            requests: (updatedHeatMap[currentSlotIndex].requests || 0) + 1
          };
          
          // Update intensity based on request count
          const requests = updatedHeatMap[currentSlotIndex].requests;
          if (requests > 10) updatedHeatMap[currentSlotIndex].intensity = 3;
          else if (requests > 5) updatedHeatMap[currentSlotIndex].intensity = 2;
          else if (requests > 0) updatedHeatMap[currentSlotIndex].intensity = 1;
          else updatedHeatMap[currentSlotIndex].intensity = 0;
        }
        
        return updatedHeatMap;
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
    if (!allChartData || allChartData.length === 0) {
      console.log('No chart data available');
      return [];
    }
    
    const timeLimit = timeRanges[activeDateRange.value];
    const now = Date.now();
    const filtered = allChartData.filter(point => (now - point.timestamp) < timeLimit);
    
    console.log(`Filtering chart data for ${activeDateRange.label}:`, {
      total: allChartData.length,
      filtered: filtered.length,
      timeLimit,
      range: activeDateRange.value
    });
    
    return filtered;
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
              onResetDashboard={() => {
                try {
                  localStorage.removeItem('allLogs');
                  localStorage.removeItem('allChartData');
                  localStorage.removeItem('heatMapData');
                } catch {}
                setAllLogs([]);
                setAllChartData([]);
                // Rebuild 60 empty minutes for heatmap
                const now = new Date();
                setHeatMapData(Array.from({ length: 60 }, (_, index) => {
                  const ts = new Date(now.getTime() - (59 - index) * 60 * 1000).getTime();
                  return { timestamp: ts, requests: 0, intensity: 0 };
                }));
              }}
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