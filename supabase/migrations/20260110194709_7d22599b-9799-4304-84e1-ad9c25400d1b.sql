-- Drop the existing view and recreate with SECURITY INVOKER
DROP VIEW IF EXISTS public.subscriptions_safe;

-- Recreate the view with security_invoker=on to respect RLS policies
CREATE VIEW public.subscriptions_safe
  WITH (security_invoker=on)
  AS
SELECT 
  id,
  user_id,
  plan,
  status,
  started_at,
  expires_at,
  created_at,
  updated_at,
  payment_provider,
  -- Mask payment_reference to show only last 4 characters for identification
  CASE 
    WHEN payment_reference IS NOT NULL AND LENGTH(payment_reference) > 4 
    THEN CONCAT('****', RIGHT(payment_reference, 4))
    WHEN payment_reference IS NOT NULL 
    THEN '****'
    ELSE NULL 
  END AS payment_reference_masked
FROM public.subscriptions;

-- Grant SELECT on the view to authenticated users
GRANT SELECT ON public.subscriptions_safe TO authenticated;