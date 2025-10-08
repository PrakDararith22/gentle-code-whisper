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

function prettyLanguage(lang: string): string {
  const l = (lang || '').toLowerCase();
  const map: Record<string, string> = {
    cpp: 'C++',
    'c++': 'C++',
    cc: 'C++',
    c: 'C',
    ts: 'TypeScript',
    typescript: 'TypeScript',
    js: 'JavaScript',
    javascript: 'JavaScript',
    jsx: 'JavaScript',
    tsx: 'TypeScript',
    py: 'Python',
    python: 'Python',
    sh: 'Bash',
    bash: 'Bash',
    shell: 'Bash',
    html: 'HTML',
    css: 'CSS',
    json: 'JSON',
    sql: 'SQL',
    go: 'Go',
    rust: 'Rust',
    rs: 'Rust',
    java: 'Java',
    php: 'PHP',
    ruby: 'Ruby',
    kt: 'Kotlin',
    kotlin: 'Kotlin',
    text: 'Code',
  };
  return map[l] || (l ? l.toUpperCase() : 'Code');
}

export function ChatMessage({ role, content, timestamp, codeBlocks }: ChatMessageProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Parse code blocks from content if they exist
  const parsedBlocks = parseCodeBlocks(content);
  const hasCodeInContent = parsedBlocks.length > 0;
  
  // If content includes fenced code, use that. Otherwise, try to extract from codeBlocks prop (may include fences).
  const displayBlocks = hasCodeInContent
    ? parsedBlocks
    : (codeBlocks || []).map(raw => {
        // Try to match fenced format
        const m = raw.match(/^```(\w+)?\n([\s\S]*?)```\s*$/);
        if (m) {
          const lang = m[1] || 'text';
          const code = m[2].trim();
          return { code, language: lang };
        }
        // Fallback: no fences, treat as plain code
        return { code: raw, language: 'text' };
      });
  
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
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'} mb-5`}>
      <div className={`
        max-w-[92vw]
        sm:max-w-[78%]
        md:max-w-[640px]
        lg:max-w-[720px]
        xl:max-w-[780px]
        overflow-hidden rounded-xl p-3 sm:p-4 shadow-sm ${
        role === 'user' 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-card border border-border'
      }`}>
        {(role !== 'assistant' || !hasCodeInContent) && textContent && (
          <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-xs sm:text-sm leading-relaxed max-h-48 sm:max-h-72 overflow-y-auto">
            {textContent}
          </p>
        )}
        
        {displayBlocks.map((block, i) => (
          <div key={i} className="mt-3">
            <div className="flex items-center justify-between bg-muted/50 px-3 py-1.5 rounded-t-lg border-b border-border">
              <span className="text-xs font-medium text-muted-foreground">
                {prettyLanguage(block.language)}
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
            <pre className="bg-muted/30 p-3 sm:p-4 rounded-b-lg overflow-x-auto border border-t-0 border-border max-h-56 sm:max-h-72 overflow-y-auto max-w-full">
              <code className="block text-[11px] sm:text-xs font-mono whitespace-pre">{block.code}</code>
            </pre>
          </div>
        ))}
        
        <span className="text-xs opacity-60 mt-3 block">{timestamp}</span>
      </div>
    </div>
  );
}
