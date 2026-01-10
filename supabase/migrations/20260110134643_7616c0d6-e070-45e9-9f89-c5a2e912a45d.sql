-- Fix the view to explicitly use SECURITY INVOKER (enforces RLS of the querying user)
DROP VIEW IF EXISTS public.api_keys_safe;

CREATE VIEW public.api_keys_safe 
WITH (security_invoker = true) AS
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