import { useState } from "react";
import { Send, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const ControlPanel = ({ onSendRequest }) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const { toast } = useToast();

  const handleToggleSimulation = () => {
    setIsSimulating(!isSimulating);
    toast({
      title: isSimulating ? "Simulation Stopped" : "Simulation Started",
      description: isSimulating 
        ? "Traffic simulation has been disabled" 
        : "Generating simulated API traffic",
    });
  };

  return (
    <div className="glass rounded-xl p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6">Control Panel</h2>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <Button
          onClick={onSendRequest}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
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
            onCheckedChange={handleToggleSimulation}
            className="data-[state=unchecked]:bg-gray-700"
          />
          <Zap className={`w-4 h-4 transition-colors ${isSimulating ? 'text-accent' : 'text-muted-foreground'}`} />
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;