import type { User, Session, AuthError as SupabaseAuthError } from '@supabase/supabase-js';

export type AuthError = SupabaseAuthError;

export interface AuthResponse {
  error: AuthError | null;
}

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface SignUpOptions {
  displayName?: string;
  metadata?: Record<string, unknown>;
}
