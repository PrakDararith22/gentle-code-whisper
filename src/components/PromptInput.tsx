import { useState, useRef } from "react";
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

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4">
      <div className="bg-prompt-bg rounded-2xl shadow-lg border border-border p-4">
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

        <div className="flex gap-3 items-end">
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
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe the code you want to generate..."
            className="min-h-[60px] max-h-[200px] resize-none border-0 focus-visible:ring-0 bg-transparent"
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
