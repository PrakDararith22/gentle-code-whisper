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
    <ScrollArea className="flex-1 p-6">
      {messages.length === 0 ? (
        <div className="text-center text-muted-foreground mt-20">
          <p>Start a conversation...</p>
        </div>
      ) : (
        messages.map((msg) => (
          <ChatMessage key={msg.id} {...msg} />
        ))
      )}
      
      {isLoading && (
        <div className="flex justify-start mb-4">
          <div className="bg-muted rounded-lg p-4">
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
            </div>
          </div>
        </div>
      )}
      
      <div ref={scrollRef} />
    </ScrollArea>
  );
}
