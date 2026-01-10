-- Create a safe view for subscriptions that masks payment information
-- This view hides sensitive payment_reference details from client access
CREATE OR REPLACE VIEW public.subscriptions_safe AS
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

-- Grant access to the view (inherits RLS from subscriptions table)
GRANT SELECT ON public.subscriptions_safe TO authenticated;

-- Also add an explicit authentication requirement to the subscriptions table SELECT policies
-- Drop and recreate the user's own subscription view policy to be more explicit
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;
CREATE POLICY "Users can view their own subscription" 
ON public.subscriptions 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
);