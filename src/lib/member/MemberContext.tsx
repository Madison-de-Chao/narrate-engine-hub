import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, Session, SupabaseClient } from '@supabase/supabase-js';
import type { Profile, AuthResponse } from './types';

export interface MemberContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string, displayName?: string) => Promise<AuthResponse>;
  signInWithGoogle: () => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResponse>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export interface MemberProviderProps {
  children: ReactNode;
  supabaseClient: SupabaseClient;
  profilesTable?: string;
  onAuthStateChange?: (user: User | null) => void;
}

/**
 * 建立自訂 Member Context
 * 用於需要完全自訂的場景
 */
export function createMemberContext() {
  return createContext<MemberContextType | undefined>(undefined);
}

const MemberContext = createContext<MemberContextType | undefined>(undefined);

/**
 * Member Provider - 包裝應用程式以提供會員認證功能
 */
export function MemberProvider({ 
  children, 
  supabaseClient,
  profilesTable = 'profiles',
  onAuthStateChange 
}: MemberProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabaseClient
        .from(profilesTable)
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          setTimeout(() => {
            fetchProfile(currentSession.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
        onAuthStateChange?.(currentSession?.user ?? null);
      }
    );

    supabaseClient.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabaseClient, profilesTable, onAuthStateChange]);

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, displayName?: string): Promise<AuthResponse> => {
    const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/` : undefined;
    
    const { error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: displayName ? { display_name: displayName } : undefined,
      },
    });
    return { error };
  };

  const signInWithGoogle = async (): Promise<AuthResponse> => {
    const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/` : undefined;
    
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectUrl },
    });
    return { error };
  };

  const resetPassword = async (email: string): Promise<AuthResponse> => {
    const redirectUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/auth/reset-password` 
      : undefined;
    
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    return { error };
  };

  const signOut = async () => {
    await supabaseClient.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');

    const { error } = await supabaseClient
      .from(profilesTable)
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) throw error;
    await fetchProfile(user.id);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const value: MemberContextType = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile,
  };

  return (
    <MemberContext.Provider value={value}>
      {children}
    </MemberContext.Provider>
  );
}

/**
 * useMember Hook - 取得會員認證狀態和方法
 */
export function useMember(): MemberContextType {
  const context = useContext(MemberContext);
  
  if (context === undefined) {
    throw new Error('useMember must be used within a MemberProvider');
  }
  
  return context;
}
