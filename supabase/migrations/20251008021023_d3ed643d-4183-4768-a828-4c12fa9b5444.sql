-- Create history table for storing code generation requests
CREATE TABLE IF NOT EXISTS public.history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on history table
ALTER TABLE public.history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own history (if logged in)
CREATE POLICY "Users can view their own history"
ON public.history
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Anyone can insert history (for anonymous and authenticated users)
CREATE POLICY "Anyone can insert history"
ON public.history
FOR INSERT
TO public
WITH CHECK (true);

-- Create index for faster queries by user_id
CREATE INDEX IF NOT EXISTS idx_history_user_id ON public.history(user_id);

-- Create index for faster queries by created_at
CREATE INDEX IF NOT EXISTS idx_history_created_at ON public.history(created_at DESC);