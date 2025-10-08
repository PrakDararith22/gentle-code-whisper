import { Sparkles } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8 py-12">
      {/* Hero Background */}
      <div className="relative w-full max-w-2xl mb-8 rounded-2xl overflow-hidden">
        <img
          src={heroBg}
          alt="Abstract illustration"
          className="w-full h-48 object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      {/* Icon */}
      <div className="mb-6 p-4 rounded-2xl bg-accent">
        <Sparkles className="h-8 w-8 text-accent-foreground" />
      </div>

      {/* Text */}
      <h2 className="text-2xl font-semibold mb-3 text-foreground">
        No snippets yet — let's start building something lovely
      </h2>
      <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
        Describe the code you want to create in the prompt bar below. 
        I'll generate beautiful, working code for you.
      </p>

      {/* Quick tips */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full">
        {[
          { label: "Generate", desc: "Create new code" },
          { label: "Fix", desc: "Improve existing code" },
          { label: "Explain", desc: "Understand code better" },
        ].map((tip) => (
          <div
            key={tip.label}
            className="p-4 rounded-lg bg-secondary border border-border text-left"
          >
            <p className="font-medium text-sm mb-1">{tip.label}</p>
            <p className="text-xs text-muted-foreground">{tip.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
