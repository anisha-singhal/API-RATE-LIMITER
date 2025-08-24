import { useState, useEffect, useCallback } from "react";
import { Search, Filter, BarChart3, RefreshCw } from "lucide-react"; // Added Search
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const CommandPalette = ({
  onFilterErrors,
  onToggleSimulation,
  onRefreshData,
}) => {
  const [open, setOpen] = useState(false);

  const commands = [
    {
      id: "filter-errors",
      label: "Filter for Errors",
      action: () => { onFilterErrors(); setOpen(false); },
      group: "Filters",
      icon: Filter,
    },
    {
      id: "toggle-simulation",
      label: "Toggle Traffic Simulation",
      action: () => { onToggleSimulation(); setOpen(false); },
      group: "Actions",
      icon: RefreshCw,
    },
    {
      id: "refresh-data",
      label: "Refresh Dashboard",
      action: () => { onRefreshData(); setOpen(false); },
      group: "Actions",
      icon: BarChart3,
    },
  ];

  const handleKeyDown = useCallback((e) => {
    if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const groupedCommands = commands.reduce((acc, command) => {
    if (!acc[command.group]) {
      acc[command.group] = [];
    }
    acc[command.group].push(command);
    return acc;
  }, {});

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command className="rounded-lg border shadow-md">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
            <CommandInput
              placeholder="Type a command or search..."
              className="pl-2 text-white" 
            />
          </div>
          {/* --------------------------------- */}
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {Object.entries(groupedCommands).map(([group, groupCommands]) => (
              <CommandGroup key={group} heading={group}>
                {groupCommands.map((command) => {
                  const Icon = command.icon;
                  return (
                    <CommandItem
                      key={command.id}
                      onSelect={command.action}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{command.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
      
      <div className="text-xs text-gray-500 flex items-center space-x-1">
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-gray-700 px-1.5 font-mono text-[10px] font-medium text-gray-300">
          <span className="text-xs">Ctrl</span>K
        </kbd>
        <span className="hidden sm:inline">to open command palette</span>
      </div>
    </>
  );
};

export default CommandPalette;