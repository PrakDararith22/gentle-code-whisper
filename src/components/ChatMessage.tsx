interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  codeBlocks?: string[];
}

export function ChatMessage({ role, content, timestamp, codeBlocks }: ChatMessageProps) {
  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] rounded-lg p-4 ${
        role === 'user' 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-muted'
      }`}>
        <p className="whitespace-pre-wrap">{content}</p>
        
        {codeBlocks?.map((code, i) => (
          <pre key={i} className="mt-2 bg-code-bg p-3 rounded overflow-x-auto">
            <code>{code}</code>
          </pre>
        ))}
        
        <span className="text-xs opacity-70 mt-2 block">{timestamp}</span>
      </div>
    </div>
  );
}
