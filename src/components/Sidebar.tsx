import { Code2, FileCode, MoreVertical, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HistoryPanel } from "@/components/HistoryPanel";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onLoadConversation?: (id: string) => void;
  refreshTrigger?: number;
  // show temporary new chat item
  isNewChat?: boolean;
  onNewChat?: () => void;
  // styling controls
  noBorder?: boolean;
  fullWidth?: boolean;
}

export function Sidebar({ isCollapsed, onToggle, onLoadConversation, refreshTrigger, isNewChat, onNewChat, noBorder = false, fullWidth = false }: SidebarProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      localStorage.removeItem('chat_messages');
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive',
      });
    }
  };

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <aside
      className={`
        ${fullWidth ? "w-full" : isCollapsed ? "w-16" : "w-64"}
        transition-all duration-300 ease-in-out
        bg-sidebar ${noBorder ? "" : "border-r border-sidebar-border"}
        flex flex-col h-full
      `}
    >
      {/* Header */}
      <div className={`${noBorder ? "h-12" : "h-14"} flex items-center justify-between px-4 ${noBorder ? "" : "border-b border-sidebar-border"}`}>
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-primary" />
            <span className="font-semibold leading-none text-sidebar-foreground">Vibe</span>
          </div>
        )}
        {!noBorder && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <FileCode className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Content */}
      <ScrollArea className={`flex-1 ${noBorder ? "" : "px-2"} py-4`}>
        {!isCollapsed && (
          <HistoryPanel 
            onLoadConversation={onLoadConversation || (() => {})} 
            refreshTrigger={refreshTrigger}
            isNewChat={!!isNewChat}
            onNewChat={onNewChat || (() => {})}
          />
        )}
      </ScrollArea>

      {/* Footer - Account Section */}
      <div className={`p-2 ${noBorder ? "" : "border-t border-sidebar-border"}`}>
        {user ? (
          !isCollapsed ? (
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent">
              {/* Profile Picture Circle */}
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                {getInitials(user.email || 'U')}
              </div>
              
              {/* Name & Email */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.email?.split('@')[0]}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
              
              {/* 3-dot Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem disabled>
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="w-full"
              title={user.email}
            >
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">
                {getInitials(user.email || 'U')}
              </div>
            </Button>
          )
        ) : (
          <Button
            variant="ghost"
            className={`w-full ${isCollapsed ? "justify-center px-0" : "justify-start"}`}
            onClick={() => navigate('/login')}
          >
            <User className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Sign In</span>}
          </Button>
        )}
      </div>
    </aside>
  );
}
