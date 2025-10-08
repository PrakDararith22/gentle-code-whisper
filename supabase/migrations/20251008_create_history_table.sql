-- Create history table for storing chat conversations
CREATE TABLE IF NOT EXISTS public.history (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_history_user_id ON public.history(user_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_history_created_at ON public.history(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.history ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own history
CREATE POLICY "Users can view their own history"
  ON public.history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own history
CREATE POLICY "Users can insert their own history"
  ON public.history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own history
CREATE POLICY "Users can update their own history"
  ON public.history
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy: Users can delete their own history
CREATE POLICY "Users can delete their own history"
  ON public.history
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_history_updated_at
  BEFORE UPDATE ON public.history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
