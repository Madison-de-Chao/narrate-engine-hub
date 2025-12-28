-- Add api_key_hash column for secure storage
ALTER TABLE public.api_keys ADD COLUMN IF NOT EXISTS api_key_hash TEXT;

-- Add api_key_prefix column to store first 7 characters for display (e.g., "bz_abc...")
ALTER TABLE public.api_keys ADD COLUMN IF NOT EXISTS api_key_prefix TEXT;

-- Create index on api_key_hash for efficient lookup
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON public.api_keys(api_key_hash);

-- Note: The api_key column will be kept temporarily during migration period
-- After all users have regenerated keys, it can be dropped with:
-- ALTER TABLE public.api_keys DROP COLUMN api_key;

COMMENT ON COLUMN public.api_keys.api_key_hash IS 'SHA-256 hash of the API key for secure verification';
COMMENT ON COLUMN public.api_keys.api_key_prefix IS 'First 7 characters of API key for display purposes (e.g., bz_abc)';