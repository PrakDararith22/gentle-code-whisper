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
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Initialize: Clean empty chats and start fresh on mount
  useEffect(() => {
    // Clean up empty conversations from localStorage
    const cleanEmptyChats = () => {
      const localHistory = localStorage.getItem('chat_history');
      if (localHistory) {
        try {
          const history = JSON.parse(localHistory);
          const nonEmpty = history.filter((item: any) => 
            item.messages && item.messages.length > 0
          );
          localStorage.setItem('chat_history', JSON.stringify(nonEmpty));
        } catch (error) {
          console.error('Failed to clean empty chats:', error);
        }
      }
    };

    cleanEmptyChats();
    
    // Always start with a fresh new chat
    setMessages([]);
    setCurrentConversationId(null);
    localStorage.removeItem('chat_messages');
  }, []);

  const startNewChat = () => {
    setMessages([]);
    
    // Create new conversation ID immediately
    const newConversationId = Date.now().toString();
    setCurrentConversationId(newConversationId);
    
    // Create placeholder in history (will be saved when first message is sent)
    const placeholder = {
      id: newConversationId,
      prompt: 'New Chat',
      messages: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    if (!user) {
      // Add placeholder to localStorage
      const localHistory = localStorage.getItem('chat_history');
      let history = [];
      if (localHistory) {
        try {
          history = JSON.parse(localHistory);
        } catch (error) {
          console.error('Failed to parse local history:', error);
        }
      }
      history.unshift(placeholder);
      localStorage.setItem('chat_history', JSON.stringify(history));
      localStorage.removeItem('chat_messages');
    }
    
    // Trigger history panel refresh
    setRefreshTrigger(prev => prev + 1);
    
    toast({
      title: 'New chat started',
      description: 'Start a fresh conversation',
    });
  };


  const saveToHistory = async (prompt: string, response: string) => {
    let conversationId = currentConversationId;
    
    // Create new conversation ID if this is the first message
    if (!conversationId) {
      conversationId = Date.now().toString();
      setCurrentConversationId(conversationId);
    }

    // Get the first prompt for the title (from the very first message in the conversation)
    const firstPrompt = messages.length > 0 && messages[0].role === 'user' 
      ? messages[0].content 
      : prompt;

    // Build the complete message history including the latest exchange
    const allMessages = [...messages];
    
    const historyItem = {
      id: conversationId,
      prompt: firstPrompt, // Title shown in sidebar
      messages: allMessages, // All messages in this conversation
      created_at: conversationId === currentConversationId 
        ? (messages.length > 0 ? messages[0].timestamp : new Date().toISOString())
        : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (user) {
      // Save/update to database for signed-in users
      const { data: existing } = await supabase
        .from('history')
        .select('id')
        .eq('id', conversationId)
        .single();

      if (existing) {
        // Update existing conversation with full message history
        await supabase.from('history').update({
          messages: allMessages,
          response,
          updated_at: new Date().toISOString(),
        }).eq('id', conversationId);
      } else {
        // Create new conversation with full message history
        await supabase.from('history').insert({
          id: conversationId,
          user_id: user.id,
          prompt: firstPrompt,
          response,
          messages: allMessages,
        });
      }
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
      
      // Remove old version if exists
      history = history.filter((item: any) => item.id !== conversationId);
      
      // Add updated conversation at the beginning
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
        // Load all messages if available (for localStorage)
        if (data.messages && Array.isArray(data.messages)) {
          setMessages(data.messages);
        } else {
          // Fallback for database (only has first prompt and last response)
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
        }
        
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
        isNewChat={messages.length === 0}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onNewChat={startNewChat}
        onLoadConversation={loadConversation}
        refreshTrigger={refreshTrigger}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative">
        {/* Top Header */}
        <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <h1 className="text-sm font-medium text-muted-foreground">
            Chat
          </h1>
          <div className="flex items-center gap-4">
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
