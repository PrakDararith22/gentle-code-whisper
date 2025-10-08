import { Copy, Wrench, MessageSquare, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SnippetCardProps {
  code: string;
  language: string;
  timestamp?: string;
}

export function SnippetCard({ code, language, timestamp }: SnippetCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-card rounded-xl border border-code-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden animate-fade-in group">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-code-bg border-b border-code-border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {language}
          </span>
          {timestamp && (
            <span className="text-xs text-muted-foreground">• {timestamp}</span>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleCopy}
            title={copied ? "Copied!" : "Copy code"}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-primary" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="Fix code"
          >
            <Wrench className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="Explain code"
          >
            <MessageSquare className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Code Content */}
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
        <code className="text-foreground">{code}</code>
      </pre>
    </div>
  );
}
