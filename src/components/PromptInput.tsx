import { useState, useRef, useEffect } from "react";
import { Paperclip, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface PromptInputProps {
  onSubmit: (prompt: string, files?: File[]) => void;
}

export function PromptInput({ onSubmit }: PromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    // Validate file types
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'text/javascript', 'text/typescript', 'text/python', 'text/html', 'text/css', 'text/plain'];
    const invalidFiles = selectedFiles.filter(file => !validTypes.includes(file.type) && !file.name.match(/\.(js|ts|py|html|css|txt)$/));
    
    if (invalidFiles.length > 0) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload images (.png, .jpg) or code files (.js, .ts, .py, .html, .css)',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate file size (5MB max per file)
    const largeFiles = selectedFiles.filter(file => file.size > 5 * 1024 * 1024);
    if (largeFiles.length > 0) {
      toast({
        title: 'File too large',
        description: 'Each file must be less than 5MB',
        variant: 'destructive',
      });
      return;
    }
    
    setFiles(prev => [...prev, ...selectedFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (prompt.trim() || files.length > 0) {
      onSubmit(prompt, files);
      setPrompt("");
      setFiles([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize the textarea up to 2 lines, then enable scrolling
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    const lineHeight = 20; // px, matches leading-5
    const maxLines = 2;
    const verticalPadding = 20; // px, matches py-2.5 (10px top + 10px bottom)
    const maxHeight = lineHeight * maxLines + verticalPadding; // ~60px

    el.style.height = "auto";
    // compute how many lines the content needs (approx)
    const contentHeight = el.scrollHeight - verticalPadding;
    const lines = Math.max(1, Math.ceil(contentHeight / lineHeight));
    const baseHeight = lineHeight + verticalPadding; // 40px -> aligns with 40px icon buttons
    const target = lines <= 1 ? baseHeight : Math.min(el.scrollHeight, maxHeight);
    el.style.height = `${target}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [prompt]);

  return (
    <div
      className={
        [
          // Mobile: full width with a small gap from bottom
          "z-50 fixed bottom-3 left-0 right-0 px-3 pb-0",
          // Desktop+: align to content area (parent main is relative)
          "md:absolute md:bottom-6 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-3xl md:px-4 md:pb-0",
        ].join(" ")
      }
    >
      <div className="w-full bg-prompt-bg rounded-xl md:rounded-2xl shadow-lg border border-border p-3 md:p-4 pb-[calc(env(safe-area-inset-bottom)+12px)] md:pb-4">
        {/* File Previews */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-lg text-sm"
              >
                <span className="truncate max-w-[150px]">{file.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 items-center">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.js,.ts,.py,.html,.css,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0"
            title="Attach file"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          <Textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe the code you want to generate..."
            rows={1}
            className="flex-1 min-w-0 min-h-0 resize-none border-0 rounded-none bg-transparent px-0 focus-visible:ring-0 leading-5 py-2.5 placeholder:text-muted-foreground"
          />

          <Button
            onClick={handleSubmit}
            disabled={!prompt.trim() && files.length === 0}
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
