import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  checkRateLimit, 
  createRateLimitResponse, 
  addRateLimitHeaders,
  RATE_LIMITS 
} from "../_shared/rateLimiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

/**
 * Extract client IP from request headers
 */
function getClientIP(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || req.headers.get('x-real-ip') 
    || 'unknown';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, email, phone, password } = await req.json();
    const clientIP = getClientIP(req);
    
    // Validate action
    if (!['login', 'signup', 'reset_password'].includes(action)) {
      return new Response(
        JSON.stringify({ error: '無效的操作' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine rate limit key based on action
    let rateLimitKey: string;
    let rateLimitConfig;
    
    switch (action) {
      case 'login':
        // Rate limit by identifier (email/phone) + IP to prevent distributed attacks
        const identifier = email || phone || '';
        rateLimitKey = `auth:login:${identifier}:${clientIP}`;
        rateLimitConfig = RATE_LIMITS.AUTH_LOGIN;
        break;
      case 'signup':
        // Rate limit by IP for signups
        rateLimitKey = `auth:signup:${clientIP}`;
        rateLimitConfig = RATE_LIMITS.AUTH_SIGNUP;
        break;
      case 'reset_password':
        // Rate limit by email + IP
        rateLimitKey = `auth:reset:${email || ''}:${clientIP}`;
        rateLimitConfig = RATE_LIMITS.AUTH_PASSWORD_RESET;
        break;
      default:
        rateLimitKey = `auth:unknown:${clientIP}`;
        rateLimitConfig = RATE_LIMITS.AUTH_LOGIN;
    }

    // Check rate limit
    const rateLimitResult = checkRateLimit(rateLimitKey, rateLimitConfig);
    
    if (!rateLimitResult.allowed) {
      console.log(`[auth-rate-limit] Rate limit exceeded for ${action}: ${rateLimitKey}`);
      return createRateLimitResponse(rateLimitResult, corsHeaders);
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    let result;
    
    switch (action) {
      case 'login':
        if (email) {
          result = await supabase.auth.signInWithPassword({ email, password });
        } else if (phone) {
          result = await supabase.auth.signInWithPassword({ phone, password });
        } else {
          return new Response(
            JSON.stringify({ error: '請提供電子郵件或手機號碼' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        break;
        
      case 'signup':
        if (email) {
          result = await supabase.auth.signUp({ 
            email, 
            password,
            options: { emailRedirectTo: req.headers.get('origin') || undefined }
          });
        } else if (phone) {
          result = await supabase.auth.signUp({ phone, password });
        } else {
          return new Response(
            JSON.stringify({ error: '請提供電子郵件或手機號碼' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        break;
        
      case 'reset_password':
        if (!email) {
          return new Response(
            JSON.stringify({ error: '請提供電子郵件' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        result = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${req.headers.get('origin')}/auth?mode=reset`
        });
        break;
    }

    // Handle auth errors with generic messages (prevent user enumeration)
    if (result?.error) {
      console.log(`[auth-rate-limit] Auth error for ${action}:`, result.error.message);
      
      // Return generic error messages to prevent user enumeration
      let errorMessage = '驗證失敗，請檢查您的資料';
      
      if (result.error.message.includes('already registered')) {
        errorMessage = '此帳號已被註冊';
      } else if (result.error.message.includes('Invalid login')) {
        errorMessage = '帳號或密碼錯誤';
      } else if (result.error.message.includes('rate limit')) {
        errorMessage = '請求過於頻繁，請稍後再試';
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Success response
    const responseHeaders = new Headers({
      ...corsHeaders,
      'Content-Type': 'application/json'
    });
    addRateLimitHeaders(responseHeaders, rateLimitResult, rateLimitConfig.maxRequests);

    console.log(`[auth-rate-limit] ${action} successful, remaining: ${rateLimitResult.remaining}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        data: result?.data,
        rateLimitRemaining: rateLimitResult.remaining
      }),
      { status: 200, headers: Object.fromEntries(responseHeaders.entries()) }
    );

  } catch (error) {
    console.error("[auth-rate-limit] Error:", error);
    return new Response(
      JSON.stringify({ error: '服務暫時不可用，請稍後再試' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
