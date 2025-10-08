# Gentle Code Whisper

An AI-powered code generation assistant with a calm, intelligent interface.

## 🚀 Tech Stack

- **Frontend**: Vite + React 18 + TypeScript
- **UI**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (Database + Edge Functions)
- **AI**: Google Gemini API

## 📋 Prerequisites

- Node.js 18+ (recommended: use [nvm](https://github.com/nvm-sh/nvm))
- Supabase account
- Google Gemini API key

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create/update `.env` with your Supabase credentials:

```env
VITE_SUPABASE_PROJECT_ID="your_project_id"
VITE_SUPABASE_PUBLISHABLE_KEY="your_anon_key"
VITE_SUPABASE_URL="https://your_project.supabase.co"
```

### 3. Set Up Database

Run the SQL migration files in `supabase/migrations/` via Supabase Dashboard SQL Editor to create tables and storage buckets.

### 4. Deploy Edge Function

Deploy the `generate` function to Supabase:

```bash
supabase functions deploy generate
```

Set the required environment variable in Supabase Dashboard:
- `GEMINI_API_KEY` - Your Google Gemini API key

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:8080](http://localhost:8080)

## 🎯 Features

- ✨ AI-powered code generation using Google Gemini
- 📝 Clean, minimal interface
- 💾 History tracking (stored in Supabase)
- 🖼️ Image upload support for visual prompts
- 📋 Copy generated code with one click
- 🌓 Light/dark mode support

## 📦 Project Structure

```
├── src/
│   ├── components/     # React components
│   ├── pages/          # Page components
│   ├── hooks/          # Custom React hooks
│   └── lib/            # Utilities
├── supabase/
│   ├── functions/      # Edge functions
│   └── migrations/     # Database migrations
└── public/             # Static assets
```

## 🔑 API Keys

Get your API keys:
- **Gemini API**: [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Supabase**: [Supabase Dashboard](https://supabase.com/dashboard)

## 📝 License

MIT
