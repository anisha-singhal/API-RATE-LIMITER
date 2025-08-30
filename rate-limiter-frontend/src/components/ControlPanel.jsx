import { useState } from 'react';
import { Send, Save, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const ControlPanel = ({ onSendRequest, isSimulating, onToggleSimulation, onUpdateConfig }) => {
  const [bucketSize, setBucketSize] = useState('');
  const [refillRate, setRefillRate] = useState('');

  const handleApplyChanges = () => {
    if (bucketSize && refillRate) {
      onUpdateConfig({
        bucketSize: parseInt(bucketSize, 10),
        refillRate: parseInt(refillRate, 10),
      });
      setBucketSize('');
      setRefillRate('');
    }
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg h-full flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-semibold text-gray-100 mb-6">Control Panel</h3>
        <div className="flex items-center justify-between">
            <Button
              onClick={onSendRequest}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Request
            </Button>
            
            <div className="flex items-center space-x-3">
              <Label 
                htmlFor="simulate-traffic" 
                className="text-sm text-muted-foreground cursor-pointer"
              >
                Simulate Traffic
              </Label>
              <Switch
                id="simulate-traffic"
                checked={isSimulating}
                onCheckedChange={onToggleSimulation}
                className="data-[state=unchecked]:bg-slate-800 data-[state=checked]:bg-primary"
              />
              <Zap className={`w-4 h-4 transition-colors ${isSimulating ? 'text-yellow-400' : 'text-gray-500'}`} />
            </div>
        </div>
      </div>
      
      <div className="border-t border-gray-700 my-6"></div>

      <div>
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Configuration</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="bucket-size" className="text-sm text-gray-400">Bucket Capacity</Label>
            <Input 
              id="bucket-size" 
              type="number" 
              placeholder="e.g., 20" 
              value={bucketSize}
              onChange={(e) => setBucketSize(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="refill-rate" className="text-sm text-gray-400">Refill Rate (tokens/sec)</Label>
            <Input 
              id="refill-rate" 
              type="number" 
              placeholder="e.g., 5"
              value={refillRate}
              onChange={(e) => setRefillRate(e.target.value)}
            />
          </div>
          <Button onClick={handleApplyChanges} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            <Save className="mr-2 h-4 w-4" /> Apply Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;

