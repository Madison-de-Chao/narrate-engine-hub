-- Create a secure view for api_keys that excludes sensitive columns (api_key_hash, api_key_prefix)
-- Users will query this view instead of the table directly

CREATE OR REPLACE VIEW public.api_keys_safe AS
SELECT 
  id,
  user_id,
  name,
  is_active,
  requests_count,
  last_used_at,
  created_at,
  updated_at,
  plan_id,
  default_template_id
FROM public.api_keys;

-- Grant access to the view for authenticated users
GRANT SELECT ON public.api_keys_safe TO authenticated;

-- Add a comment explaining the purpose
COMMENT ON VIEW public.api_keys_safe IS 'Secure view of api_keys excluding sensitive hash and prefix columns to prevent offline brute-force attacks';