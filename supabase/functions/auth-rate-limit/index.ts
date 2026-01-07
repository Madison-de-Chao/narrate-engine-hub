import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";
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
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

/**
 * Extract client IP from request headers
 */
function getClientIP(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || req.headers.get('x-real-ip') 
    || 'unknown';
}

/**
 * Format lockout duration for display
 */
function formatLockoutDuration(minutes: number): string {
  if (minutes >= 1440) {
    return '24小時';
  } else if (minutes >= 60) {
    return `${Math.floor(minutes / 60)}小時`;
  }
  return `${minutes}分鐘`;
}

/**
 * Send lockout notification email
 */
async function sendLockoutEmail(
  email: string, 
  lockoutMinutes: number, 
  ipAddress: string
): Promise<void> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    console.log('[auth-rate-limit] RESEND_API_KEY not configured, skipping email notification');
    return;
  }

  try {
    const resend = new Resend(resendApiKey);
    const lockoutDuration = formatLockoutDuration(lockoutMinutes);
    const unlockTime = new Date(Date.now() + lockoutMinutes * 60 * 1000);
    const formattedUnlockTime = unlockTime.toLocaleString('zh-TW', { 
      timeZone: 'Asia/Taipei',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    await resend.emails.send({
      from: '虹靈御所安全通知 <security@resend.dev>',
      to: [email],
      subject: '⚠️ 帳戶安全警告：登入嘗試次數過多',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .alert-box { background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin: 20px 0; }
            .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .footer { text-align: center; color: #888; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 帳戶暫時鎖定</h1>
            </div>
            <div class="content">
              <p>親愛的用戶，</p>
              <p>我們偵測到您的帳戶有多次登入失敗的嘗試。為了保護您的帳戶安全，我們已暫時鎖定登入功能。</p>
              
              <div class="alert-box">
                <strong>⏰ 鎖定時間：</strong>${lockoutDuration}<br>
                <strong>🔓 預計解鎖：</strong>${formattedUnlockTime}
              </div>

              <h3>登入嘗試資訊</h3>
              <div class="info-row">
                <span>IP 位址：</span>
                <span>${ipAddress}</span>
              </div>
              <div class="info-row">
                <span>時間：</span>
                <span>${new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}</span>
              </div>

              <h3>如果這不是您本人操作</h3>
              <p>請在鎖定解除後立即：</p>
              <ol>
                <li>更改您的密碼</li>
                <li>檢查帳戶活動記錄</li>
                <li>確認電子郵件地址未被更改</li>
              </ol>

              <p>如需協助，請聯繫我們的客服團隊。</p>
              
              <div class="footer">
                <p>此郵件由虹靈御所系統自動發送，請勿直接回覆。</p>
                <p>© ${new Date().getFullYear()} 虹靈御所八字人生兵法</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log(`[auth-rate-limit] Lockout notification sent to ${email}`);
  } catch (error) {
    console.error('[auth-rate-limit] Failed to send lockout email:', error);
  }
}

/**
 * Check if account is locked using database function
 */
async function checkAccountLockout(
  supabase: any, 
  identifier: string
): Promise<{ isLocked: boolean; lockedUntil: Date | null; failedAttempts: number }> {
  const { data, error } = await supabase.rpc('check_account_lockout', {
    p_identifier: identifier
  });

  if (error) {
    console.error('[auth-rate-limit] Error checking lockout:', error);
    return { isLocked: false, lockedUntil: null, failedAttempts: 0 };
  }

  if (data && data.length > 0) {
    return {
      isLocked: data[0].is_locked,
      lockedUntil: data[0].locked_until ? new Date(data[0].locked_until) : null,
      failedAttempts: data[0].failed_attempts
    };
  }

  return { isLocked: false, lockedUntil: null, failedAttempts: 0 };
}

/**
 * Record login attempt and check for lockout trigger
 */
async function recordLoginAttempt(
  supabase: any,
  identifier: string,
  identifierType: 'email' | 'phone',
  ipAddress: string,
  success: boolean
): Promise<{ isNowLocked: boolean; lockoutMinutes: number }> {
  const { data, error } = await supabase.rpc('record_login_attempt', {
    p_identifier: identifier,
    p_identifier_type: identifierType,
    p_ip_address: ipAddress,
    p_success: success
  });

  if (error) {
    console.error('[auth-rate-limit] Error recording attempt:', error);
    return { isNowLocked: false, lockoutMinutes: 0 };
  }

  if (data && data.length > 0) {
    return {
      isNowLocked: data[0].is_now_locked,
      lockoutMinutes: data[0].lockout_duration_minutes
    };
  }

  return { isNowLocked: false, lockoutMinutes: 0 };
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

    // Create Supabase clients
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const identifier = email || phone || '';
    const identifierType = email ? 'email' : 'phone';

    // For login attempts, check if account is locked
    if (action === 'login' && identifier) {
      const lockoutStatus = await checkAccountLockout(supabaseAdmin, identifier);
      
      if (lockoutStatus.isLocked && lockoutStatus.lockedUntil) {
        const remainingMinutes = Math.ceil(
          (lockoutStatus.lockedUntil.getTime() - Date.now()) / 60000
        );
        const remainingTime = formatLockoutDuration(remainingMinutes);
        
        console.log(`[auth-rate-limit] Account locked: ${identifier}, remaining: ${remainingTime}`);
        
        return new Response(
          JSON.stringify({ 
            error: `帳戶已暫時鎖定，請在 ${remainingTime} 後再試`,
            isLocked: true,
            lockedUntil: lockoutStatus.lockedUntil.toISOString()
          }),
          { status: 423, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Determine rate limit key based on action
    let rateLimitKey: string;
    let rateLimitConfig;
    
    switch (action) {
      case 'login':
        rateLimitKey = `auth:login:${identifier}:${clientIP}`;
        rateLimitConfig = RATE_LIMITS.AUTH_LOGIN;
        break;
      case 'signup':
        rateLimitKey = `auth:signup:${clientIP}`;
        rateLimitConfig = RATE_LIMITS.AUTH_SIGNUP;
        break;
      case 'reset_password':
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
        
        // Record the attempt (success or failure)
        const loginSuccess = !result.error;
        const lockoutResult = await recordLoginAttempt(
          supabaseAdmin,
          identifier,
          identifierType as 'email' | 'phone',
          clientIP,
          loginSuccess
        );

        // If account just got locked, send email notification
        if (lockoutResult.isNowLocked && email) {
          // Send email asynchronously
          sendLockoutEmail(email, lockoutResult.lockoutMinutes, clientIP).catch(err => {
            console.error('[auth-rate-limit] Background email error:', err);
          });
          
          return new Response(
            JSON.stringify({ 
              error: `登入失敗次數過多，帳戶已鎖定 ${formatLockoutDuration(lockoutResult.lockoutMinutes)}`,
              isLocked: true
            }),
            { status: 423, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
