import { useState } from 'react';
import { Send, Save, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

import axios from 'axios';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000';

const ControlPanel = ({ onSendRequest, isSimulating, onToggleSimulation, onUpdateConfig, onResetDashboard }) => {
  const [bucketSize, setBucketSize] = useState('');
  const [refillRate, setRefillRate] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

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

          {/* Centered Reset Button with confirmation modal */}
          <div className="pt-4 flex justify-center">
            <Button
              onClick={() => setConfirmOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Reset Dashboard
            </Button>
          </div>

          <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogContent className="bg-gray-900 text-gray-100 border-gray-700">
              <DialogHeader>
                <DialogTitle>Reset dashboard data?</DialogTitle>
                <DialogDescription>
                  This will clear local charts, logs, and heatmap data. Optionally, it will also reset the backend buckets and config.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="sm:justify-center gap-2">
                <Button
                  variant="outline"
                  className="bg-gray-800 hover:bg-gray-700 border-gray-600"
                  onClick={() => setConfirmOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={async () => {
                    try {
                      await axios.post(`${API_BASE_URL}/api/reset`, { what: 'all' });
                    } catch (e) {
                      console.warn('Backend reset failed', e);
                    }
                    onResetDashboard?.();
                    setConfirmOpen(false);
                  }}
                >
                  Yes, reset
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;

