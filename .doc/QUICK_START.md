# Quick Start Guide
## Get Started in 5 Minutes

**Last Updated:** October 8, 2025

---

## 🎯 What You Need to Know

### Current Situation:
- ✅ Backend works (Supabase + Gemini API)
- ✅ Basic UI exists
- ❌ Missing 6 critical features

### Your Goal:
Build a ChatGPT-like code assistant in 3 weeks

---

## 📖 Read This First

**Main Guide:** Open `.doc/FEATURES.md`

This has EVERYTHING:
- What's missing
- 6 features to build
- Tasks for each feature
- Code examples
- Testing checklists

---

## 🚀 Start Coding (Right Now)

### Step 1: Create Chat Message Component (30 min)

```bash
# Create the file
touch src/components/ChatMessage.tsx
```

**Copy this code:**

```typescript
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
```

**Test it:**
```typescript
// In Index.tsx, add temporarily:
<ChatMessage 
  role="user" 
  content="Create a React button" 
  timestamp="10:30 AM" 
/>
<ChatMessage 
  role="assistant" 
  content="Here's the code:" 
  timestamp="10:30 AM"
  codeBlocks={['const Button = () => <button>Click</button>']}
/>
```

**You should see:** Two chat bubbles, one on right (blue), one on left (gray)

---

### Step 2: Create Chat Thread Component (30 min)

```bash
touch src/components/ChatThread.tsx
```

**Copy this code:**

```typescript
import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './ChatMessage';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  codeBlocks?: string[];
}

interface ChatThreadProps {
  messages: Message[];
  isLoading?: boolean;
}

export function ChatThread({ messages, isLoading }: ChatThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  return (
    <ScrollArea className="flex-1 p-6">
      {messages.length === 0 ? (
        <div className="text-center text-muted-foreground mt-20">
          <p>Start a conversation...</p>
        </div>
      ) : (
        messages.map((msg) => (
          <ChatMessage key={msg.id} {...msg} />
        ))
      )}
      
      {isLoading && (
        <div className="flex justify-start mb-4">
          <div className="bg-muted rounded-lg p-4">
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
            </div>
          </div>
        </div>
      )}
      
      <div ref={scrollRef} />
    </ScrollArea>
  );
}
```

---

### Step 3: Update Index.tsx (1 hour)

**Open:** `src/pages/Index.tsx`

**Replace the state:**

```typescript
// OLD:
const [snippets, setSnippets] = useState<Snippet[]>([]);

// NEW:
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  codeBlocks?: string[];
}

const [messages, setMessages] = useState<Message[]>([]);
const [isLoading, setIsLoading] = useState(false);
```

**Replace handlePromptSubmit:**

```typescript
const handlePromptSubmit = async (prompt: string) => {
  // Add user message immediately
  const userMessage: Message = {
    id: Date.now().toString(),
    role: 'user',
    content: prompt,
    timestamp: new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
  setMessages(prev => [...prev, userMessage]);
  
  // Show loading
  setIsLoading(true);
  
  try {
    // Call API (existing code)
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

    const data = await response.json();

    if (data.status === "success") {
      // Add AI message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Here\'s the code:',
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        codeBlocks: [data.code],
      };
      setMessages(prev => [...prev, aiMessage]);
    }
  } catch (error) {
    console.error('Error:', error);
    // Add error message
    const errorMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: 'Sorry, something went wrong. Please try again.',
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setMessages(prev => [...prev, errorMessage]);
  } finally {
    setIsLoading(false);
  }
};
```

**Replace the content area:**

```typescript
// OLD:
<ScrollArea className="flex-1 pb-32">
  <div className="container max-w-4xl mx-auto px-6 py-8">
    {snippets.length === 0 ? (
      <EmptyState />
    ) : (
      <div className="space-y-6">
        {snippets.map((snippet) => (
          <SnippetCard key={snippet.id} {...snippet} />
        ))}
      </div>
    )}
  </div>
</ScrollArea>

// NEW:
<ChatThread messages={messages} isLoading={isLoading} />
```

**Update header:**

```typescript
<header className="h-14 border-b border-border flex items-center justify-between px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <h1 className="text-sm font-medium text-muted-foreground">
    Chat
  </h1>
  <div className="text-xs text-muted-foreground">
    {messages.length} {messages.length === 1 ? 'message' : 'messages'}
  </div>
</header>
```

---

### Step 4: Test It! (10 min)

```bash
npm run dev
```

**Open:** http://localhost:8080

**Try:**
1. Type: "Create a React button"
2. Press Enter
3. You should see:
   - Your message on the right (blue)
   - Loading dots
   - AI response on the left (gray) with code

**✅ If this works, you've completed Day 1 Part 1!**

---

## 📅 What's Next?

### Today (Rest of Day 1):
- [ ] Add "New Chat" button
- [ ] Add copy button to code blocks
- [ ] Improve styling

### Tomorrow (Day 2):
- [ ] Set up Supabase Auth
- [ ] Create login page
- [ ] Test authentication

### This Week:
- Day 1-2: Chat Interface ✅
- Day 3-4: Authentication
- Day 5: History Panel

---

## 📖 Full Documentation

**For complete details, see:**
- `.doc/FEATURES.md` - Complete guide organized by feature
- `.doc/srs.md` - Original requirements

---

## 🆘 Troubleshooting

### Import errors?
```bash
# Make sure you have the components
ls src/components/ui/scroll-area.tsx
```

### TypeScript errors?
```bash
# Check your tsconfig.json has:
"paths": {
  "@/*": ["./src/*"]
}
```

### Styling looks wrong?
```bash
# Make sure Tailwind is working
npm run dev
```

---

## 🎯 Success Criteria

**You're on track if:**
- ✅ Can see chat bubbles
- ✅ User messages on right (blue)
- ✅ AI messages on left (gray)
- ✅ Loading indicator shows
- ✅ Code displays in blocks

**Next milestone:** Authentication (Day 3-4)

---

**Time to complete this guide:** ~2 hours  
**Progress after:** ~5% → 20%  
**Next step:** Continue with FEATURES.md

---

Good luck! 🚀
