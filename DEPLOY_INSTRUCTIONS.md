# Deployment Instructions

## 1. Create History Table in Supabase

### Option A: Using Supabase Dashboard (Easiest)

1. Go to your Supabase project: https://supabase.com/dashboard/project/cdhhcyubfwmvfqhzeldn
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `supabase/migrations/20251008_create_history_table.sql`
5. Click **Run** to execute the SQL

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref cdhhcyubfwmvfqhzeldn

# Push migrations
supabase db push
```

---

## 2. Deploy Edge Function

### Option A: Using Supabase Dashboard

1. Go to **Edge Functions** in your Supabase dashboard
2. Click **Create Function**
3. Name it: `generate`
4. Copy the code from `supabase/functions/generate/index.ts`
5. Click **Deploy**

### Option B: Using Supabase CLI

```bash
# Deploy the generate function
supabase functions deploy generate

# Set environment variables
supabase secrets set GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 3. Verify Setup

### Check Database Table

Run this query in SQL Editor:

```sql
SELECT * FROM public.history LIMIT 10;
```

### Check Edge Function

Test the function:

```bash
curl -X POST \
  https://cdhhcyubfwmvfqhzeldn.supabase.co/functions/v1/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"prompt": "Create a hello world function"}'
```

---

## 4. Environment Variables Needed

Make sure these are set in Supabase:

### Edge Function Secrets:
- `GEMINI_API_KEY` - Your Google Gemini API key

### Frontend .env:
```
VITE_SUPABASE_URL=https://cdhhcyubfwmvfqhzeldn.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
```

---

## Quick Start (Recommended)

1. **Create Table**: Copy SQL from `supabase/migrations/20251008_create_history_table.sql` → Run in SQL Editor
2. **Set Gemini Key**: Go to Edge Functions → Settings → Add secret `GEMINI_API_KEY`
3. **Deploy Function**: Copy code from `supabase/functions/generate/index.ts` → Create new function in dashboard
4. **Test**: Try creating a chat in your app!

---

## Troubleshooting

### "Table does not exist"
- Run the migration SQL in SQL Editor

### "Function not found"
- Deploy the edge function from dashboard or CLI

### "Authentication error"
- Check that Email provider is enabled in Authentication settings
- Verify your anon key is correct in .env

### "Gemini API error"
- Set GEMINI_API_KEY in Edge Function secrets
- Verify your Gemini API key is valid
