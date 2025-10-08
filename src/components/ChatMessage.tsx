import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  codeBlocks?: string[];
}

export function ChatMessage({ role, content, timestamp, codeBlocks }: ChatMessageProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (code: string, index: number) => {
    await navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] rounded-lg p-4 ${
        role === 'user' 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-muted'
      }`}>
        <p className="whitespace-pre-wrap">{content}</p>
        
        {codeBlocks?.map((code, i) => (
          <div key={i} className="mt-3 relative group">
            {codeBlocks.length > 1 && (
              <div className="text-xs text-muted-foreground mb-1">
                Code block {i + 1} of {codeBlocks.length}
              </div>
            )}
            <div className="relative">
              <pre className="bg-code-bg p-3 rounded overflow-x-auto">
                <code>{code}</code>
              </pre>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => copyToClipboard(code, i)}
              >
                {copiedIndex === i ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        ))}
        
        <span className="text-xs opacity-70 mt-2 block">{timestamp}</span>
      </div>
    </div>
  );
}
