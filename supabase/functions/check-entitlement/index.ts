import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CENTRAL_API_URL = 'https://yyzcgxnvtprojutnxisz.supabase.co/functions/v1/entitlements-lookup';
const DEFAULT_PRODUCT_ID = 'bazi-academy'; // 可根據需求修改

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const centralServiceRoleKey = Deno.env.get('CENTRAL_SUPABASE_SERVICE_ROLE_KEY');

    if (!centralServiceRoleKey) {
      console.error('CENTRAL_SUPABASE_SERVICE_ROLE_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Central API key not configured', hasAccess: false }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'No authorization header', hasAccess: false }),
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
        JSON.stringify({ error: 'Invalid user token', hasAccess: false }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userEmail = user.email;
    if (!userEmail) {
      console.error('User has no email');
      return new Response(
        JSON.stringify({ error: 'User email not found', hasAccess: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get product_id from query params
    const url = new URL(req.url);
    const productId = url.searchParams.get('product_id') || DEFAULT_PRODUCT_ID;

    console.log(`Checking entitlement for email: ${userEmail}, product: ${productId}`);

    // Call central API
    const centralApiUrl = `${CENTRAL_API_URL}?email=${encodeURIComponent(userEmail)}&product_id=${encodeURIComponent(productId)}`;
    
    const centralResponse = await fetch(centralApiUrl, {
      method: 'GET',
      headers: {
        'X-API-Key': centralServiceRoleKey,
      },
    });

    if (!centralResponse.ok) {
      const errorText = await centralResponse.text();
      console.error('Central API error:', centralResponse.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Central API request failed', 
          hasAccess: false,
          details: errorText 
        }),
        { status: centralResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const entitlementData = await centralResponse.json();
    console.log('Entitlement response:', JSON.stringify(entitlementData));

    // Determine access based on central API response
    const hasAccess = entitlementData.hasAccess === true || 
                      entitlementData.has_access === true ||
                      (Array.isArray(entitlementData.entitlements) && entitlementData.entitlements.length > 0);

    return new Response(
      JSON.stringify({
        hasAccess,
        email: userEmail,
        productId,
        entitlements: entitlementData.entitlements || [],
        expiresAt: entitlementData.expires_at || entitlementData.expiresAt || null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error in check-entitlement:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', hasAccess: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
