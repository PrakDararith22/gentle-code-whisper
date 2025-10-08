import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  codeBlocks?: string[];
}

// Parse code blocks from markdown format
function parseCodeBlocks(text: string): Array<{ code: string; language: string }> {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const blocks: Array<{ code: string; language: string }> = [];
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    const language = match[1] || 'text';
    const code = match[2].trim();
    if (code) {
      blocks.push({ code, language });
    }
  }

  return blocks;
}

export function ChatMessage({ role, content, timestamp, codeBlocks }: ChatMessageProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Parse code blocks from content if they exist
  const parsedBlocks = parseCodeBlocks(content);
  const hasCodeInContent = parsedBlocks.length > 0;
  
  // Use parsed blocks if available, otherwise use codeBlocks prop
  const displayBlocks = hasCodeInContent ? parsedBlocks : (codeBlocks || []).map(code => ({ code, language: 'text' }));
  
  // Remove code blocks from content for display
  const textContent = hasCodeInContent 
    ? content.replace(/```(\w+)?\n[\s\S]*?```/g, '').trim()
    : content;

  const copyToClipboard = async (code: string, index: number) => {
    await navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`max-w-[85%] rounded-xl p-4 shadow-sm ${
        role === 'user' 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-card border border-border'
      }`}>
        {textContent && <p className="whitespace-pre-wrap text-sm leading-relaxed">{textContent}</p>}
        
        {displayBlocks.map((block, i) => (
          <div key={i} className="mt-3">
            <div className="flex items-center justify-between bg-muted/50 px-3 py-1.5 rounded-t-lg border-b border-border">
              <span className="text-xs font-medium text-muted-foreground uppercase">
                {block.language}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 hover:bg-background"
                onClick={() => copyToClipboard(block.code, i)}
              >
                {copiedIndex === i ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    <span className="text-xs">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    <span className="text-xs">Copy code</span>
                  </>
                )}
              </Button>
            </div>
            <pre className="bg-muted/30 p-4 rounded-b-lg overflow-x-auto border border-t-0 border-border">
              <code className="text-sm font-mono">{block.code}</code>
            </pre>
          </div>
        ))}
        
        <span className="text-xs opacity-60 mt-3 block">{timestamp}</span>
      </div>
    </div>
  );
}
