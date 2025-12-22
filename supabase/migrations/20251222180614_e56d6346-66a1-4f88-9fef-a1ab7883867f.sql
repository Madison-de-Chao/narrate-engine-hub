-- Create API keys table for external developers
CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  api_key TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  requests_count INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster API key lookups
CREATE INDEX idx_api_keys_api_key ON public.api_keys(api_key);
CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own API keys
CREATE POLICY "Users can view their own API keys"
ON public.api_keys FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own API keys"
ON public.api_keys FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys"
ON public.api_keys FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys"
ON public.api_keys FOR DELETE
USING (auth.uid() = user_id);

-- Create API request logs table
CREATE TABLE public.api_request_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  request_body JSONB,
  response_status INTEGER,
  response_time_ms INTEGER,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.api_request_logs ENABLE ROW LEVEL SECURITY;

-- Users can view logs for their own API keys
CREATE POLICY "Users can view their own API request logs"
ON public.api_request_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.api_keys
    WHERE api_keys.id = api_request_logs.api_key_id
    AND api_keys.user_id = auth.uid()
  )
);

-- Trigger to update updated_at
CREATE TRIGGER update_api_keys_updated_at
BEFORE UPDATE ON public.api_keys
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();