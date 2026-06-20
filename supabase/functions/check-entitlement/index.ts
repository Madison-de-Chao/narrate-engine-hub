import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * check-entitlement
 * --------------------------------------------------------------
 * 本站不再做使用者驗證。
 * 前端傳 email（query 或 body）→ 後端用 x-api-key 呼叫主站
 * story_builder_hub 的 check-entitlement，回傳是否擁有 Premium。
 *
 * 速率：60 秒記憶體快取，避免重複呼叫主站。
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const CENTRAL_URL = 'https://yrdtgwoxxjksesynrjss.supabase.co/functions/v1/check-entitlement';
const CENTRAL_PRODUCT_ID = '22222222-2222-2222-2222-222222222222';
const CACHE_TTL_MS = 60 * 1000;

interface CacheEntry {
  data: unknown;
  expires: number;
}
const cache = new Map<string, CacheEntry>();

function bad(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('CENTRAL_API_KEY');
    if (!apiKey) {
      console.error('CENTRAL_API_KEY not configured');
      return bad(500, { hasAccess: false, source: 'error', error: 'Central API key not configured' });
    }

    // 從 query 或 body 取 email
    const url = new URL(req.url);
    let email = url.searchParams.get('email');
    const productId = url.searchParams.get('product_id') || CENTRAL_PRODUCT_ID;

    if (!email && (req.method === 'POST')) {
      try {
        const body = await req.json();
        email = body?.email ?? null;
      } catch {
        // ignore
      }
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return bad(400, { hasAccess: false, source: 'error', error: 'Invalid or missing email' });
    }

    const cacheKey = `${email}|${productId}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return new Response(JSON.stringify(cached.data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'HIT' },
      });
    }

    const centralUrl = `${CENTRAL_URL}?product_id=${encodeURIComponent(productId)}&email=${encodeURIComponent(email)}`;
    const upstream = await fetch(centralUrl, {
      method: 'GET',
      headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
    });

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => '');
      console.error('Central API error', upstream.status, text);
      return bad(502, {
        hasAccess: false,
        source: 'error',
        error: 'Central API request failed',
        centralStatus: upstream.status,
      });
    }

    const data = await upstream.json();
    const hasAccess = data?.hasAccess === true;
    const result = {
      hasAccess,
      source: 'central' as const,
      email,
      productId,
      tier: hasAccess ? 'premium' : 'free',
      entitlements: data?.entitlement ? [data.entitlement] : [],
      expiresAt: data?.entitlement?.ends_at ?? null,
      raw: data,
    };

    cache.set(cacheKey, { data: result, expires: Date.now() + CACHE_TTL_MS });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'MISS' },
    });
  } catch (err) {
    console.error('check-entitlement unexpected error:', err);
    return bad(500, { hasAccess: false, source: 'error', error: 'Internal server error' });
  }
});
