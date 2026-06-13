GRANT EXECUTE ON FUNCTION public.check_account_lockout(text) TO service_role, authenticated, anon;
GRANT EXECUTE ON FUNCTION public.record_login_attempt(text, text, text, boolean) TO service_role;
NOTIFY pgrst, 'reload schema';