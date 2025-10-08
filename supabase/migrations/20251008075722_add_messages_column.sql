-- Add messages column to store full conversation
ALTER TABLE public.history 
ADD COLUMN IF NOT EXISTS messages JSONB DEFAULT '[]'::jsonb;

-- Create index on messages for faster queries
CREATE INDEX IF NOT EXISTS idx_history_messages ON public.history USING gin(messages);
