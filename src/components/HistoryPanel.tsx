import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface Conversation {
  id: string;
  prompt: string;
  created_at: string;
}

export function HistoryPanel({ onLoadConversation }: { onLoadConversation: (id: string) => void }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadHistory();
  }, [user]);

  const loadHistory = async () => {
    setConversations([]); // Clear first
    
    if (user) {
      // Load ONLY from database for signed-in users
      const { data, error } = await supabase
        .from('history')
        .select('id, prompt, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setConversations(data);
      }
    } else {
      // Load ONLY from localStorage for anonymous users
      const localHistory = localStorage.getItem('chat_history');
      if (localHistory) {
        try {
          const parsed = JSON.parse(localHistory);
          // Filter out empty conversations
          const nonEmpty = parsed.filter((item: any) => 
            item.messages && item.messages.length > 0
          );
          setConversations(nonEmpty);
        } catch (error) {
          console.error('Failed to parse local history:', error);
        }
      }
    }
    setLoading(false);
  };

  const deleteConversation = async (id: string) => {
    if (user) {
      // Delete from database
      await supabase.from('history').delete().eq('id', id);
    } else {
      // Delete from localStorage
      const localHistory = localStorage.getItem('chat_history');
      if (localHistory) {
        try {
          const parsed = JSON.parse(localHistory);
          const updated = parsed.filter((c: Conversation) => c.id !== id);
          localStorage.setItem('chat_history', JSON.stringify(updated));
        } catch (error) {
          console.error('Failed to delete from local history:', error);
        }
      }
    }
    setConversations(prev => prev.filter(c => c.id !== id));
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <ScrollArea className="h-full">
      <div className="p-2 space-y-1">
        <h3 className="text-sm font-medium px-2 mb-2">History</h3>
        
        {conversations.length === 0 ? (
          <p className="text-xs text-muted-foreground px-2">No conversations yet</p>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className="group flex items-center justify-between p-2 rounded hover:bg-accent cursor-pointer"
              onClick={() => onLoadConversation(conv.id)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{conv.prompt}</p>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(conv.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
}
