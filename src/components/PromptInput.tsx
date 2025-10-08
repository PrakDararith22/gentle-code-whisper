import { useState } from "react";
import { Paperclip, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
}

export function PromptInput({ onSubmit }: PromptInputProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = () => {
    if (prompt.trim()) {
      onSubmit(prompt);
      setPrompt("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4">
      <div className="bg-prompt-bg rounded-2xl shadow-lg border border-border p-4">
        <div className="flex gap-3 items-end">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0"
            title="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe the code you want to generate..."
            className="min-h-[60px] max-h-[200px] resize-none border-0 focus-visible:ring-0 bg-transparent"
          />

          <Button
            onClick={handleSubmit}
            disabled={!prompt.trim()}
            className="h-10 w-10 shrink-0 rounded-full"
            size="icon"
            title="Send"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
