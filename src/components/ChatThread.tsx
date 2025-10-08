import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './ChatMessage';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  codeBlocks?: string[];
}

interface ChatThreadProps {
  messages: Message[];
  isLoading?: boolean;
}

export function ChatThread({ messages, isLoading }: ChatThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  return (
    <ScrollArea className="flex-1 px-4 py-6 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-5xl mx-auto space-y-2 pb-40 md:pb-32">
        {messages.map((message) => (
          <ChatMessage key={message.id} {...message} />
        ))}
        
        {isLoading && (
          <div className="flex justify-start mb-6">
            <div className="max-w-[85%] rounded-xl p-4 bg-card border border-border shadow-sm">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
                <span className="text-sm text-muted-foreground">Generating response...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={scrollRef} />
      </div>
    </ScrollArea>
  );
}
