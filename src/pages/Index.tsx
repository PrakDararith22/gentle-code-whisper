import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { PromptInput } from "@/components/PromptInput";
import { ChatThread } from "@/components/ChatThread";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  codeBlocks?: string[];
}

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load messages from localStorage on mount (for non-authenticated users)
  useEffect(() => {
    if (!user) {
      const savedMessages = localStorage.getItem('chat_messages');
      if (savedMessages) {
        try {
          setMessages(JSON.parse(savedMessages));
        } catch (error) {
          console.error('Failed to load messages from localStorage:', error);
        }
      }
    }
  }, [user]);

  // Save messages to localStorage when they change (for non-authenticated users)
  useEffect(() => {
    if (!user && messages.length > 0) {
      localStorage.setItem('chat_messages', JSON.stringify(messages));
    }
  }, [messages, user]);

  const startNewChat = () => {
    setMessages([]);
    setCurrentConversationId(null);
    if (!user) {
      localStorage.removeItem('chat_messages');
    }
    toast({
      title: 'New chat started',
      description: 'Start a fresh conversation',
    });
  };


  const saveToHistory = async (prompt: string, response: string) => {
    // Only save if this is the first message in a new conversation
    if (currentConversationId) return;

    const conversationId = Date.now().toString();
    setCurrentConversationId(conversationId);

    const historyItem = {
      id: conversationId,
      prompt,
      response,
      created_at: new Date().toISOString(),
    };

    if (user) {
      // Save to database for signed-in users
      await supabase.from('history').insert({
        user_id: user.id,
        prompt,
        response,
      });
    } else {
      // Save to localStorage for anonymous users
      const localHistory = localStorage.getItem('chat_history');
      let history = [];
      if (localHistory) {
        try {
          history = JSON.parse(localHistory);
        } catch (error) {
          console.error('Failed to parse local history:', error);
        }
      }
      history.unshift(historyItem);
      // Keep only last 50 conversations
      if (history.length > 50) {
        history = history.slice(0, 50);
      }
      localStorage.setItem('chat_history', JSON.stringify(history));
    }
  };

  const loadConversation = async (id: string) => {
    try {
      let data = null;

      if (user) {
        // Load from database
        const result = await supabase
          .from('history')
          .select('*')
          .eq('id', id)
          .single();
        
        if (result.error) throw result.error;
        data = result.data;
      } else {
        // Load from localStorage
        const localHistory = localStorage.getItem('chat_history');
        if (localHistory) {
          const history = JSON.parse(localHistory);
          data = history.find((item: any) => item.id === id);
        }
      }

      if (data) {
        // Parse and load messages
        const userMessage: Message = {
          id: `${id}-user`,
          role: 'user',
          content: data.prompt,
          timestamp: new Date(data.created_at).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };

        const aiMessage: Message = {
          id: `${id}-ai`,
          role: 'assistant',
          content: 'Here\'s the code:',
          timestamp: new Date(data.created_at).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          codeBlocks: [data.response],
        };

        setMessages([userMessage, aiMessage]);
        setCurrentConversationId(id);
        toast({
          title: 'Conversation loaded',
          description: 'Previous conversation has been loaded',
        });
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversation',
        variant: 'destructive',
      });
    }
  };

  const handlePromptSubmit = async (prompt: string, files?: File[]) => {
    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setMessages(prev => [...prev, userMessage]);
    
    setIsLoading(true);
    
    try {
      // Convert first image file to base64 if present
      let imageBase64 = null;
      if (files && files.length > 0) {
        const imageFile = files.find(f => f.type.startsWith('image/'));
        if (imageFile) {
          imageBase64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(imageFile);
          });
        }
      }
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ 
            prompt,
            image: imageBase64 
          }),
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Here\'s the code:',
          timestamp: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          codeBlocks: [data.code],
        };
        setMessages(prev => [...prev, aiMessage]);
        
        // Save to history
        await saveToHistory(prompt, data.code);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onLoadConversation={loadConversation}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative">
        {/* Top Header */}
        <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <h1 className="text-sm font-medium text-muted-foreground">
            Chat
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-xs text-muted-foreground">
              {messages.length} {messages.length === 1 ? 'message' : 'messages'}
            </div>
            <Button variant="default" size="sm" onClick={startNewChat}>
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>
        </header>

        {/* Chat Thread */}
        <ChatThread messages={messages} isLoading={isLoading} />

        {/* Floating Prompt Input */}
        <PromptInput onSubmit={handlePromptSubmit} />
      </main>
    </div>
  );
};

export default Index;
