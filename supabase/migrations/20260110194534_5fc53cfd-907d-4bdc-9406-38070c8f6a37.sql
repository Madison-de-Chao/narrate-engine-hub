-- Drop the existing policy that only checks auth.uid() IS NOT NULL
DROP POLICY IF EXISTS "profiles_block_anonymous" ON public.profiles;

-- Create a stronger policy that ensures:
-- 1. User must be authenticated (auth.uid() IS NOT NULL)
-- 2. User can only view their own profile (auth.uid() = id) OR is an admin
CREATE POLICY "profiles_authenticated_self_or_admin" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND (
    auth.uid() = id 
    OR public.has_role(auth.uid(), 'admin')
  )
);