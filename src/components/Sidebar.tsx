import { Code2, FileCode, Sparkles, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { HistoryPanel } from "@/components/HistoryPanel";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onLoadConversation?: (id: string) => void;
}

export function Sidebar({ isCollapsed, onToggle, onLoadConversation }: SidebarProps) {
  return (
    <aside
      className={`
        ${isCollapsed ? "w-16" : "w-64"}
        transition-all duration-300 ease-in-out
        bg-sidebar border-r border-sidebar-border
        flex flex-col
      `}
    >
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sidebar-foreground">Vibe</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <FileCode className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 px-2 py-4">
        <div className="space-y-1">
          <Button
            variant="ghost"
            className={`w-full ${isCollapsed ? "justify-center px-0" : "justify-start"}`}
            title="Snippets"
          >
            <Sparkles className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Snippets</span>}
          </Button>

          <Button
            variant="ghost"
            className={`w-full ${isCollapsed ? "justify-center px-0" : "justify-start"}`}
            title="History"
          >
            <FileCode className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">History</span>}
          </Button>
        </div>

        {!isCollapsed && (
          <>
            <Separator className="my-4" />
            <HistoryPanel onLoadConversation={onLoadConversation || (() => {})} />
          </>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-2 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className={`w-full ${isCollapsed ? "justify-center px-0" : "justify-start"}`}
          title="Settings"
        >
          <Settings className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">Settings</span>}
        </Button>
      </div>
    </aside>
  );
}
