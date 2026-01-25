import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { checkRateLimit, createRateLimitResponse, RATE_LIMITS } from "../_shared/rateLimiter.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Central API endpoints (Original)
const CENTRAL_BASE_URL = 'https://yyzcgxnvtprojutnxisz.supabase.co/functions/v1';
const ENTITLEMENTS_ME_URL = `${CENTRAL_BASE_URL}/entitlements-me`;
const ENTITLEMENTS_LOOKUP_URL = `${CENTRAL_BASE_URL}/entitlements-lookup`;

// Sales Auth API endpoints (story_builder_hub)
const SALES_AUTH_BASE_URL = 'https://yrdtgwoxxjksesynrjss.supabase.co/functions/v1';
const SALES_AUTH_CHECK_URL = `${SALES_AUTH_BASE_URL}/check-entitlement`;
const SALES_AUTH_API_KEY = 'mdc_27530c756089e4af6527dadb4e43d4eb02c3cc495b964105082bf3c945c6fb32';
const SALES_AUTH_PRODUCT_ID = '22222222-2222-2222-2222-222222222222'; // story_builder_hub product ID

const DEFAULT_PRODUCT_ID = 'bazi-premium';

interface EntitlementResponse {
  hasAccess: boolean;
  source: 'sales_auth' | 'central' | 'central_fallback' | 'local' | 'error';
  email?: string;
  productId?: string;
  tier?: string;
  entitlements?: Array<{
    product_id: string;
    expires_at: string | null;
    tier?: string;
  }>;
  expiresAt?: string | null;
  error?: string;
  centralStatus?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const centralServiceRoleKey = Deno.env.get('CENTRAL_SUPABASE_SERVICE_ROLE_KEY');

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'No authorization header', hasAccess: false, source: 'error' } as EntitlementResponse),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify local user JWT
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('User verification failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid user token', hasAccess: false, source: 'error' } as EntitlementResponse),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userEmail = user.email;
    if (!userEmail) {
      console.error('User has no email');
      return new Response(
        JSON.stringify({ error: 'User email not found', hasAccess: false, source: 'error' } as EntitlementResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting check
    const rateLimitResult = checkRateLimit(`entitlement:${user.id}`, RATE_LIMITS.CHECK_ENTITLEMENT);
    if (!rateLimitResult.allowed) {
      console.log(`[check-entitlement] Rate limit exceeded for user: ${user.id}`);
      return createRateLimitResponse(rateLimitResult, corsHeaders);
    }

    // Get product_id and method from query params
    const url = new URL(req.url);
    const productId = url.searchParams.get('product_id') || DEFAULT_PRODUCT_ID;
    const method = url.searchParams.get('method') || 'jwt'; // 'jwt' or 'lookup'

    console.log(`Checking entitlement for email: ${userEmail}, product: ${productId}, method: ${method}`);

    let response: EntitlementResponse;

    // Step 1: Try Sales Auth API first (story_builder_hub)
    console.log('Trying Sales Auth API (story_builder_hub)...');
    const salesAuthResult = await trySalesAuthMethod(userEmail);
    
    if (salesAuthResult.hasAccess) {
      console.log('Sales Auth granted access');
      response = salesAuthResult;
    } else {
      console.log('Sales Auth no access, trying Central API...');
      
      // Step 2: Try Central API (JWT-based or lookup)
      if (method === 'jwt' && centralServiceRoleKey) {
      console.log('Using JWT-based entitlements-me endpoint');
      
      try {
        const meResponse = await fetch(`${ENTITLEMENTS_ME_URL}?product_id=${encodeURIComponent(productId)}`, {
          method: 'GET',
          headers: {
            'Authorization': authHeader, // Forward the user's JWT
            'X-Forwarded-Authorization': authHeader,
            'Content-Type': 'application/json',
          },
        });

        if (meResponse.ok) {
          const meData = await meResponse.json();
          console.log('entitlements-me response:', JSON.stringify(meData));

          const hasAccess = meData.hasAccess === true ||
            meData.has_access === true ||
            (Array.isArray(meData.entitlements) && meData.entitlements.length > 0);

          response = {
            hasAccess,
            source: 'central',
            email: userEmail,
            productId,
            tier: meData.tier || (hasAccess ? 'premium' : 'free'),
            entitlements: meData.entitlements || [],
            expiresAt: meData.expires_at || meData.expiresAt || null,
          };
        } else {
          console.log(`entitlements-me failed with status ${meResponse.status}, falling back to lookup`);
          // Fall through to lookup method
          response = await tryLookupMethod(centralServiceRoleKey, userEmail, productId);
        }
      } catch (jwtError) {
        console.error('JWT method error:', jwtError);
        // Fall through to lookup method
        response = await tryLookupMethod(centralServiceRoleKey, userEmail, productId);
      }
      } else if (centralServiceRoleKey) {
        // Use lookup method directly
        response = await tryLookupMethod(centralServiceRoleKey, userEmail, productId);
      } else {
        console.error('CENTRAL_SUPABASE_SERVICE_ROLE_KEY not configured');
        response = {
          hasAccess: false,
          source: 'error',
          error: 'Central API key not configured',
          email: userEmail,
          productId,
        };
      }
    }

    // If central API failed, try local subscription check
    if (!response.hasAccess && (response.source === 'error' || response.source === 'central_fallback')) {
      console.log('Central API unavailable or no access, checking local subscriptions');
      
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (subscription && (!subscription.expires_at || new Date(subscription.expires_at) > new Date())) {
        console.log('Found active local subscription:', subscription.plan);
        response = {
          hasAccess: true,
          source: 'local',
          email: userEmail,
          productId,
          tier: subscription.plan,
          expiresAt: subscription.expires_at,
        };
      }
    }

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error in check-entitlement:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', hasAccess: false, source: 'error' } as EntitlementResponse),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function for Sales Auth API (story_builder_hub)
async function trySalesAuthMethod(userEmail: string): Promise<EntitlementResponse> {
  try {
    const url = `${SALES_AUTH_CHECK_URL}?product_id=${SALES_AUTH_PRODUCT_ID}&email=${encodeURIComponent(userEmail)}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': SALES_AUTH_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Sales Auth API error: ${response.status}`);
      return {
        hasAccess: false,
        source: 'error',
        email: userEmail,
        error: `Sales Auth API returned ${response.status}`,
      };
    }

    const data = await response.json();
    console.log('Sales Auth response:', JSON.stringify(data));

    const hasAccess = data.hasAccess === true;
    
    return {
      hasAccess,
      source: 'sales_auth',
      email: userEmail,
      productId: SALES_AUTH_PRODUCT_ID,
      tier: hasAccess ? 'premium' : 'free',
      entitlements: data.entitlement ? [data.entitlement] : [],
      expiresAt: data.entitlement?.ends_at || null,
    };
  } catch (error) {
    console.error('Sales Auth API error:', error);
    return {
      hasAccess: false,
      source: 'error',
      email: userEmail,
      error: 'Sales Auth API request failed',
    };
  }
}

// Helper function for lookup method
async function tryLookupMethod(
  centralServiceRoleKey: string,
  userEmail: string,
  productId: string
): Promise<EntitlementResponse> {
  try {
    const lookupUrl = `${ENTITLEMENTS_LOOKUP_URL}?email=${encodeURIComponent(userEmail)}&product_id=${encodeURIComponent(productId)}`;
    
    const lookupResponse = await fetch(lookupUrl, {
      method: 'GET',
      headers: {
        'X-API-Key': centralServiceRoleKey,
        'Content-Type': 'application/json',
      },
    });

    if (!lookupResponse.ok) {
      const errorText = await lookupResponse.text();
      console.error('Central API lookup error:', lookupResponse.status, errorText);
      
      return {
        hasAccess: false,
        source: 'central_fallback',
        error: 'Central API request failed',
        centralStatus: lookupResponse.status,
        email: userEmail,
        productId,
      };
    }

    const entitlementData = await lookupResponse.json();
    console.log('Lookup entitlement response:', JSON.stringify(entitlementData));

    const hasAccess = entitlementData.hasAccess === true ||
      entitlementData.has_access === true ||
      (Array.isArray(entitlementData.entitlements) && entitlementData.entitlements.length > 0);

    return {
      hasAccess,
      source: 'central',
      email: userEmail,
      productId,
      tier: entitlementData.tier || (hasAccess ? 'premium' : 'free'),
      entitlements: entitlementData.entitlements || [],
      expiresAt: entitlementData.expires_at || entitlementData.expiresAt || null,
    };
  } catch (error) {
    console.error('Lookup method error:', error);
    return {
      hasAccess: false,
      source: 'error',
      error: 'Central API lookup failed',
      email: userEmail,
      productId,
    };
  }
}
