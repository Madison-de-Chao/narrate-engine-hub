-- Add explicit authentication requirement for profiles table
-- This ensures no anonymous access is possible even if other policies are misconfigured

CREATE POLICY "profiles_block_anonymous" ON public.profiles
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Add comment explaining the purpose
COMMENT ON POLICY "profiles_block_anonymous" ON public.profiles IS 
'Explicit authentication gate to prevent any anonymous access to user profiles containing email addresses';