-- Create table to track failed login attempts and account lockouts
CREATE TABLE public.login_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL, -- email or phone
  identifier_type TEXT NOT NULL CHECK (identifier_type IN ('email', 'phone')),
  ip_address TEXT,
  attempt_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  success BOOLEAN NOT NULL DEFAULT false,
  lockout_until TIMESTAMP WITH TIME ZONE,
  lockout_notified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient lookups
CREATE INDEX idx_login_attempts_identifier ON public.login_attempts(identifier);
CREATE INDEX idx_login_attempts_attempt_at ON public.login_attempts(attempt_at);
CREATE INDEX idx_login_attempts_lockout ON public.login_attempts(identifier) WHERE lockout_until IS NOT NULL;

-- Enable RLS
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Only allow service role to manage login attempts (security sensitive)
CREATE POLICY "Service role can manage login attempts"
ON public.login_attempts
FOR ALL
USING (auth.role() = 'service_role');

-- Function to check if account is locked
CREATE OR REPLACE FUNCTION public.check_account_lockout(p_identifier TEXT)
RETURNS TABLE(is_locked BOOLEAN, locked_until TIMESTAMP WITH TIME ZONE, failed_attempts INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lockout_until TIMESTAMP WITH TIME ZONE;
  v_failed_count INTEGER;
  v_window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Check for active lockout
  SELECT la.lockout_until INTO v_lockout_until
  FROM login_attempts la
  WHERE la.identifier = p_identifier
    AND la.lockout_until IS NOT NULL
    AND la.lockout_until > now()
  ORDER BY la.lockout_until DESC
  LIMIT 1;

  IF v_lockout_until IS NOT NULL THEN
    RETURN QUERY SELECT true, v_lockout_until, 0;
    RETURN;
  END IF;

  -- Count failed attempts in the last 15 minutes
  v_window_start := now() - INTERVAL '15 minutes';
  SELECT COUNT(*)::INTEGER INTO v_failed_count
  FROM login_attempts la
  WHERE la.identifier = p_identifier
    AND la.success = false
    AND la.attempt_at >= v_window_start;

  RETURN QUERY SELECT false, NULL::TIMESTAMP WITH TIME ZONE, v_failed_count;
END;
$$;

-- Function to record login attempt
CREATE OR REPLACE FUNCTION public.record_login_attempt(
  p_identifier TEXT,
  p_identifier_type TEXT,
  p_ip_address TEXT,
  p_success BOOLEAN
)
RETURNS TABLE(is_now_locked BOOLEAN, lockout_duration_minutes INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_failed_count INTEGER;
  v_lockout_duration INTEGER;
  v_lockout_until TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Insert the attempt
  INSERT INTO login_attempts (identifier, identifier_type, ip_address, success)
  VALUES (p_identifier, p_identifier_type, p_ip_address, p_success);

  -- If successful, clear old failed attempts
  IF p_success THEN
    DELETE FROM login_attempts
    WHERE identifier = p_identifier
      AND success = false
      AND attempt_at < now() - INTERVAL '1 hour';
    
    RETURN QUERY SELECT false, 0;
    RETURN;
  END IF;

  -- Count recent failed attempts
  SELECT COUNT(*)::INTEGER INTO v_failed_count
  FROM login_attempts
  WHERE identifier = p_identifier
    AND success = false
    AND attempt_at >= now() - INTERVAL '15 minutes';

  -- Progressive lockout: 5 fails = 15 min, 10 fails = 1 hour, 15+ fails = 24 hours
  IF v_failed_count >= 15 THEN
    v_lockout_duration := 1440; -- 24 hours
  ELSIF v_failed_count >= 10 THEN
    v_lockout_duration := 60; -- 1 hour
  ELSIF v_failed_count >= 5 THEN
    v_lockout_duration := 15; -- 15 minutes
  ELSE
    RETURN QUERY SELECT false, 0;
    RETURN;
  END IF;

  -- Set lockout
  v_lockout_until := now() + (v_lockout_duration || ' minutes')::INTERVAL;
  
  UPDATE login_attempts
  SET lockout_until = v_lockout_until, lockout_notified = false
  WHERE identifier = p_identifier
    AND attempt_at = (
      SELECT MAX(attempt_at) FROM login_attempts WHERE identifier = p_identifier
    );

  RETURN QUERY SELECT true, v_lockout_duration;
END;
$$;

-- Cleanup old login attempts (run periodically)
CREATE OR REPLACE FUNCTION public.cleanup_old_login_attempts()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM login_attempts
  WHERE attempt_at < now() - INTERVAL '7 days';
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;