import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { PromptInput } from "@/components/PromptInput";
import { SnippetCard } from "@/components/SnippetCard";
import { EmptyState } from "@/components/EmptyState";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Snippet {
  id: string;
  code: string;
  language: string;
  timestamp: string;
}

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [snippets, setSnippets] = useState<Snippet[]>([]);

  const handlePromptSubmit = async (prompt: string) => {
    try {
      // Call backend edge function for code generation
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ prompt }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate code");
      }

      const data = await response.json();

      if (data.status === "success") {
        const newSnippet: Snippet = {
          id: Date.now().toString(),
          code: data.code,
          language: "JavaScript",
          timestamp: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        setSnippets((prev) => [newSnippet, ...prev]);
      }
    } catch (error) {
      console.error("Error generating code:", error);
      // Fallback to show error message
      const errorSnippet: Snippet = {
        id: Date.now().toString(),
        code: `// Error: Unable to generate code\n// ${error instanceof Error ? error.message : "Unknown error"}`,
        language: "JavaScript",
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setSnippets((prev) => [errorSnippet, ...prev]);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative">
        {/* Top Header */}
        <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <h1 className="text-sm font-medium text-muted-foreground">
            Workspace
          </h1>
          <div className="text-xs text-muted-foreground">
            {snippets.length} {snippets.length === 1 ? "snippet" : "snippets"}
          </div>
        </header>

        {/* Content Area with Padding for Prompt Input */}
        <ScrollArea className="flex-1 pb-32">
          <div className="container max-w-4xl mx-auto px-6 py-8">
            {snippets.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-6">
                {snippets.map((snippet) => (
                  <SnippetCard
                    key={snippet.id}
                    code={snippet.code}
                    language={snippet.language}
                    timestamp={snippet.timestamp}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Floating Prompt Input */}
        <PromptInput onSubmit={handlePromptSubmit} />
      </main>
    </div>
  );
};

export default Index;
