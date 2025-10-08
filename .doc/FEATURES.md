# Implementation Guide - By Feature
## Vibe Code Assistant

**Last Updated:** October 8, 2025  
**Current Progress:** 15%

---

## 📋 Overview

### What's Working ✅
- Backend (Supabase + Gemini API)
- Basic UI (Sidebar, PromptInput, SnippetCard)
- Can generate code from prompt

### What's Missing ❌
6 features need to be implemented

---

## 🎯 The 6 Features

### Feature Checklist

- [x] **Feature 1: Chat Interface** (10-12 hours) 🔴 CRITICAL ✅
- [ ] **Feature 2: Authentication** (12-14 hours) 🔴 CRITICAL
- [ ] **Feature 3: History Panel** (8-10 hours) 🔴 CRITICAL
- [ ] **Feature 4: File Attachments** (8-10 hours) 🟡 HIGH
- [ ] **Feature 5: Multiple Snippets** (6-8 hours) 🟢 MEDIUM
- [ ] **Feature 6: Branding** (2-3 hours) 🟢 LOW

**Total:** ~50-60 hours (2-3 weeks)

---

## 🔴 Feature 1: Chat Interface

### Goal
Transform from single-snippet view to ChatGPT-style conversation interface.

### Current Problem
- Only shows final code snippet
- Can't see what you asked
- No conversation flow

### What You'll Build
```
Chat Interface:
┌─────────────────────────────────┐
│ User: Create a button           │ ← Right side, blue
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ AI: Here's the code:            │ ← Left side, gray
│ ```javascript                   │
│ const Button = () => {}         │
│ ```                             │
└─────────────────────────────────┘
```

---

### Task Checklist

- [x] Task 1.1: Create ChatMessage Component (2 hours) ✅
- [x] Task 1.2: Create ChatThread Component (2 hours) ✅
- [x] Task 1.3: Update Index.tsx for Chat Layout (3-4 hours) ✅
- [x] Task 1.4: Add "New Chat" Button (1 hour) ✅

---

### Tasks

#### Task 1.1: Create ChatMessage Component
**File:** `src/components/ChatMessage.tsx`  
**Time:** 2 hours

**What it does:** Displays a single message bubble (user or AI)

**Code:**
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

**Checklist:**
- [ ] Create file
- [ ] Add TypeScript interface
- [ ] Style user messages (right, blue)
- [ ] Style AI messages (left, gray)
- [ ] Add timestamp
- [ ] Support code blocks
- [ ] Test with dummy data

---

#### Task 1.2: Create ChatThread Component
**File:** `src/components/ChatThread.tsx`  
**Time:** 2 hours

**What it does:** Displays list of messages with auto-scroll

**Code:**
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

**Checklist:**
- [ ] Create file
- [ ] Map through messages
- [ ] Auto-scroll to bottom
- [ ] Add loading indicator
- [ ] Handle empty state
- [ ] Test scrolling

---

#### Task 1.3: Update Index.tsx for Chat Layout
**File:** `src/pages/Index.tsx`  
**Time:** 3-4 hours

**Changes needed:**

**1. Update state:**
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

**2. Update handlePromptSubmit:**
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
  
  setIsLoading(true);
  
  try {
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
  } finally {
    setIsLoading(false);
  }
};
```

**3. Replace content area:**
```typescript
// OLD:
<ScrollArea className="flex-1 pb-32">
  <div className="container max-w-4xl mx-auto px-6 py-8">
    {snippets.length === 0 ? <EmptyState /> : ...}
  </div>
</ScrollArea>

// NEW:
<ChatThread messages={messages} isLoading={isLoading} />
```

**Checklist:**
- [ ] Change state structure
- [ ] Update handleSubmit
- [ ] Add loading state
- [ ] Replace SnippetCard with ChatThread
- [ ] Update header
- [ ] Test full flow

---

#### Task 1.4: Add "New Chat" Button
**File:** `src/pages/Index.tsx`  
**Time:** 1 hour

**Code:**
```typescript
const startNewChat = () => {
  setMessages([]);
};

// In header:
<Button variant="outline" size="sm" onClick={startNewChat}>
  <Plus className="h-4 w-4 mr-2" />
  New Chat
</Button>
```

**Checklist:**
- [ ] Add button to header
- [ ] Clear messages on click
- [ ] Test new chat

---

### Feature 1 Validation

**You're done when:**
- [ ] Messages display in chat bubbles
- [ ] User messages on right (blue)
- [ ] AI messages on left (gray)
- [ ] Auto-scrolls to new messages
- [ ] Loading indicator shows while waiting
- [ ] Can start new chat
- [ ] Code blocks display properly

**Total Time:** 10-12 hours

---

## 🔴 Feature 2: Authentication

### Goal
Add user accounts with login/signup using Supabase Auth.

### Current Problem
- No authentication
- Anyone can access
- No user-specific data

### What You'll Build
- Login page
- Signup page
- Protected routes
- User-specific history

---

### Task Checklist

- [ ] Task 2.1: Enable Supabase Auth (30 min)
- [ ] Task 2.2: Create Auth Context (3 hours)
- [ ] Task 2.3: Create Login Page (3 hours)
- [ ] Task 2.4: Create Signup Page (2 hours)
- [ ] Task 2.5: Create Protected Route Component (2 hours)
- [ ] Task 2.6: Update App.tsx Routing (1 hour)
- [ ] Task 2.7: Update Edge Function for User ID (1 hour)

---

### Tasks

#### Task 2.1: Enable Supabase Auth
**Location:** Supabase Dashboard  
**Time:** 30 minutes

**Steps:**
1. Go to https://supabase.com/dashboard/project/cdhhcyubfwmvfqhzeldn
2. Click "Authentication" → "Providers"
3. Enable "Email" provider
4. Set Site URL: `http://localhost:8080`
5. Add Redirect URLs: `http://localhost:8080/auth/callback`
6. Save

**Checklist:**
- [ ] Email provider enabled
- [ ] Site URL configured
- [ ] Redirect URLs added

---

#### Task 2.2: Create Auth Context
**File:** `src/contexts/AuthContext.tsx`  
**Time:** 3 hours

**Code:**
```typescript
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

**Also create:** `src/lib/supabase.ts`
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

**Checklist:**
- [ ] Create supabase.ts
- [ ] Create AuthContext.tsx
- [ ] Implement signUp, signIn, signOut
- [ ] Add session persistence
- [ ] Test in console

---

#### Task 2.3: Create Login Page
**File:** `src/pages/Login.tsx`  
**Time:** 3 hours

**Code:**
```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signIn(email, password);
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to log in',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 bg-card rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6">Login to Vibe</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </Button>
        </form>
        
        <p className="mt-4 text-center text-sm">
          Don't have an account?{' '}
          <a href="/signup" className="text-primary hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
```

**Checklist:**
- [ ] Create page file
- [ ] Add form with validation
- [ ] Handle submit
- [ ] Show loading state
- [ ] Display errors
- [ ] Add signup link
- [ ] Test login flow

---

#### Task 2.4: Create Signup Page
**File:** `src/pages/Signup.tsx`  
**Time:** 2 hours

Similar to Login page but with signUp function.

**Checklist:**
- [ ] Create page file
- [ ] Add email/password form
- [ ] Add password confirmation
- [ ] Handle signup
- [ ] Test signup flow

---

#### Task 2.5: Create Protected Route Component
**File:** `src/components/ProtectedRoute.tsx`  
**Time:** 2 hours

**Code:**
```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

**Checklist:**
- [ ] Create component
- [ ] Check auth state
- [ ] Redirect if not authenticated
- [ ] Show loading state

---

#### Task 2.6: Update App.tsx Routing
**File:** `src/App.tsx`  
**Time:** 1 hour

**Code:**
```typescript
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);
```

**Checklist:**
- [ ] Wrap app in AuthProvider
- [ ] Add login/signup routes
- [ ] Protect dashboard route
- [ ] Test routing

---

#### Task 2.7: Update Edge Function for User ID
**File:** `supabase/functions/generate/index.ts`  
**Time:** 1 hour

**Changes:**
```typescript
// Extract user from JWT
const authHeader = req.headers.get('Authorization');
const token = authHeader?.replace('Bearer ', '');

let userId = null;
if (token) {
  const { data: { user } } = await supabase.auth.getUser(token);
  userId = user?.id;
}

// When inserting to history:
const { error: insertError } = await supabase
  .from('history')
  .insert({
    user_id: userId,  // Use extracted user ID
    prompt: prompt,
    response: generatedCode,
    image_url: imageUrl
  });
```

**Checklist:**
- [ ] Extract user from JWT
- [ ] Pass user ID to history
- [ ] Test with authenticated request

---

### Feature 2 Validation

**You're done when:**
- [ ] Can sign up with email/password
- [ ] Can log in
- [ ] Can log out
- [ ] Protected routes redirect to login
- [ ] Session persists on refresh
- [ ] Only logged-in users can access app
- [ ] History is user-specific

**Total Time:** 12-14 hours

---

## 🔴 Feature 3: History Panel

### Goal
Display past conversations in sidebar, allow loading and deleting them.

### Current Problem
- Backend stores all conversations in `history` table
- No UI to view them
- Users can't access past chats

### What You'll Build
```
Sidebar:
├── New Chat
├── History
│   ├── "Create React button" (2 hours ago)
│   ├── "Fix this bug" (yesterday)
│   └── "Explain async/await" (2 days ago)
```

---

### Task Checklist

- [ ] Task 3.1: Create HistoryPanel Component (4 hours)
- [ ] Task 3.2: Integrate into Sidebar (2 hours)
- [ ] Task 3.3: Load Conversation on Click (3 hours)

---

### Tasks

#### Task 3.1: Create HistoryPanel Component
**File:** `src/components/HistoryPanel.tsx`  
**Time:** 4 hours

**Code:**
```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface Conversation {
  id: string;
  prompt: string;
  created_at: string;
}

export function HistoryPanel({ onLoadConversation }: { onLoadConversation: (id: string) => void }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadHistory();
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('history')
      .select('id, prompt, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setConversations(data);
    }
    setLoading(false);
  };

  const deleteConversation = async (id: string) => {
    await supabase.from('history').delete().eq('id', id);
    setConversations(prev => prev.filter(c => c.id !== id));
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <ScrollArea className="h-full">
      <div className="p-2 space-y-1">
        <h3 className="text-sm font-medium px-2 mb-2">History</h3>
        
        {conversations.length === 0 ? (
          <p className="text-xs text-muted-foreground px-2">No conversations yet</p>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className="group flex items-center justify-between p-2 rounded hover:bg-accent cursor-pointer"
              onClick={() => onLoadConversation(conv.id)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{conv.prompt}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(conv.created_at).toLocaleDateString()}
                </p>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(conv.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
}
```

**Checklist:**
- [ ] Create component
- [ ] Fetch history from Supabase
- [ ] Display list
- [ ] Add click handler
- [ ] Add delete button
- [ ] Test with real data

---

#### Task 3.2: Integrate into Sidebar
**File:** `src/components/Sidebar.tsx`  
**Time:** 2 hours

**Add HistoryPanel to sidebar below existing content.**

**Checklist:**
- [ ] Import HistoryPanel
- [ ] Add to sidebar
- [ ] Pass onLoadConversation callback
- [ ] Test integration

---

#### Task 3.3: Load Conversation on Click
**File:** `src/pages/Index.tsx`  
**Time:** 3 hours

**Code:**
```typescript
const loadConversation = async (id: string) => {
  const { data, error } = await supabase
    .from('history')
    .select('*')
    .eq('id', id)
    .single();

  if (!error && data) {
    // Parse and load messages
    const userMessage: Message = {
      id: `${id}-user`,
      role: 'user',
      content: data.prompt,
      timestamp: new Date(data.created_at).toLocaleTimeString(),
    };

    const aiMessage: Message = {
      id: `${id}-ai`,
      role: 'assistant',
      content: 'Here\'s the code:',
      timestamp: new Date(data.created_at).toLocaleTimeString(),
      codeBlocks: [data.response],
    };

    setMessages([userMessage, aiMessage]);
  }
};

// Pass to Sidebar:
<Sidebar onLoadConversation={loadConversation} />
```

**Checklist:**
- [ ] Implement loadConversation
- [ ] Fetch conversation by ID
- [ ] Parse into messages
- [ ] Load into chat
- [ ] Test loading

---

### Feature 3 Validation

**You're done when:**
- [ ] History loads in sidebar
- [ ] Can click to load conversation
- [ ] Can delete conversation
- [ ] Only shows user's own history
- [ ] Updates in real-time

**Total Time:** 8-10 hours

---

## 🟡 Feature 4: File Attachments

### Goal
Allow users to upload images and code files with their prompts.

### Current Problem
- Backend accepts files
- No upload UI

### What You'll Build
- File upload button
- File preview
- Support images (.png, .jpg) and code (.js, .ts, .py, .html, .css)

---

### Task Checklist

- [ ] Task 4.1: Add File Upload to PromptInput (4 hours)
- [ ] Task 4.2: Create FilePreview Component (2 hours)
- [ ] Task 4.3: Display Files in Chat (2 hours)

---

### Tasks

#### Task 4.1: Add File Upload to PromptInput
**File:** `src/components/PromptInput.tsx`  
**Time:** 4 hours

**Add file input and preview.**

**Checklist:**
- [ ] Add file input button
- [ ] Handle file selection
- [ ] Convert to Base64
- [ ] Show preview
- [ ] Send with prompt

---

#### Task 4.2: Create FilePreview Component
**File:** `src/components/FilePreview.tsx`  
**Time:** 2 hours

**Display uploaded files with remove option.**

---

#### Task 4.3: Display Files in Chat
**File:** `src/components/ChatMessage.tsx`  
**Time:** 2 hours

**Show attached files in messages.**

---

### Feature 4 Validation

**You're done when:**
- [ ] Can upload images
- [ ] Can upload code files
- [ ] Files preview correctly
- [ ] AI references files in response

**Total Time:** 8-10 hours

---

## 🟢 Feature 5: Multiple Code Snippets

### Goal
Support multiple code blocks in a single AI response.

---

### Task Checklist

- [ ] Task 5.1: Create Code Parser (3 hours)
- [ ] Task 5.2: Update ChatMessage (3 hours)

---

### Tasks

#### Task 5.1: Create Code Parser
**File:** `src/utils/codeParser.ts`  
**Time:** 3 hours

**Parse multiple code blocks from AI response.**

---

#### Task 5.2: Update ChatMessage
**File:** `src/components/ChatMessage.tsx`  
**Time:** 3 hours

**Display multiple code blocks.**

---

### Feature 5 Validation

**You're done when:**
- [ ] Multiple code blocks display
- [ ] Each has copy button
- [ ] Snippets are numbered

**Total Time:** 6-8 hours

---

## 🟢 Feature 6: Branding

### Goal
Add custom Vibe logo and favicon.

---

### Task Checklist

- [ ] Task 6.1: Create/Obtain Logo (2 hours)
- [ ] Task 6.2: Update Favicon (1 hour)

---

### Tasks

#### Task 6.1: Create/Obtain Logo
**Time:** 2 hours

**Design or obtain Vibe logo.**

---

#### Task 6.2: Update Favicon
**Files:** `public/favicon.ico`, `index.html`  
**Time:** 1 hour

**Replace favicon and add PWA manifest.**

---

### Feature 6 Validation

**You're done when:**
- [ ] Favicon shows in browser tab
- [ ] Logo appears in app
- [ ] Looks professional

**Total Time:** 2-3 hours

---

## ✅ Testing & Validation

### After Each Feature

**Chat Interface:**
- [ ] Messages display correctly
- [ ] Auto-scrolls
- [ ] Loading indicator works
- [ ] Can start new chat

**Authentication:**
- [ ] Can sign up
- [ ] Can log in
- [ ] Can log out
- [ ] Protected routes work
- [ ] Session persists

**History:**
- [ ] History loads
- [ ] Can load conversation
- [ ] Can delete conversation
- [ ] User-specific data

**File Attachments:**
- [ ] Can upload files
- [ ] Files preview
- [ ] AI uses file context

**Multiple Snippets:**
- [ ] Multiple blocks display
- [ ] Can copy each

**Branding:**
- [ ] Favicon displays
- [ ] Logo shows

---

## 📊 Progress Tracking

### Overall Progress: 32%

*15% (setup) + 17% (Feature 1 complete)*

**Setup Complete:**
- [x] Backend (Supabase + Gemini API)
- [x] Basic UI components
- [x] Can generate code from prompt

**Features to Implement:**
- [x] Feature 1: Chat Interface (100%) ✅
- [ ] Feature 2: Authentication (0%)
- [ ] Feature 3: History Panel (0%)
- [ ] Feature 4: File Attachments (0%)
- [ ] Feature 5: Multiple Snippets (0%)
- [ ] Feature 6: Branding (0%)

---

## 🎯 Recommended Order

1. **Start:** Feature 1 (Chat Interface)
2. **Then:** Feature 2 (Authentication)
3. **Then:** Feature 3 (History Panel)
4. **Then:** Feature 4 (File Attachments)
5. **Then:** Feature 5 (Multiple Snippets)
6. **Finally:** Feature 6 (Branding)

---

**Total Estimated Time:** 50-60 hours (2-3 weeks)  
**Start with:** Feature 1, Task 1.1 (ChatMessage component)
