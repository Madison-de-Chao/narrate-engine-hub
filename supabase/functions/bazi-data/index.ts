import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { checkRateLimit, createRateLimitResponse } from "../_shared/rateLimiter.ts";

/**
 * bazi-data — 嚴格 RLS 後唯一的資料讀寫閘道
 * --------------------------------------------------------------
 * 三張使用者資料表（bazi_calculations / legion_stories /
 * story_regeneration_credits）已禁止 anon/authenticated 直接存取。
 * 所有讀寫一律經由本函式以 service_role 執行，並強制以 user_email 過濾。
 *
 * 請求格式：
 *   POST /functions/v1/bazi-data
 *   body: { op: string, email: string, ...payload }
 *
 * 重要安全注意：
 *   - email 由前端 localStorage 提供，本系統不具備 email 擁有權證明
 *     （未啟用 OTP/SSO），仍存在「他人輸入你的 email 即可看到你的資料」
 *     的設計限制。透過鎖死 RLS + 集中閘道 + 速率限制，至少可阻止
 *     anon key 大量抓取與隨意刪改。
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE = { windowMs: 60_000, maxRequests: 60 };

function json(status: number, body: unknown, extra?: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...(extra ?? {}) },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  let payload: Record<string, unknown> = {};
  try {
    payload = await req.json();
  } catch {
    return json(400, { error: "Invalid JSON body" });
  }

  const op = String(payload.op ?? "").trim();
  const rawEmail = String(payload.email ?? "").trim().toLowerCase();

  if (!op) return json(400, { error: "Missing op" });
  if (!EMAIL_RE.test(rawEmail)) return json(400, { error: "Invalid email" });

  // Per-email rate limit (also covers per-IP indirectly)
  const rl = checkRateLimit(`bazi-data:${rawEmail}`, RATE);
  if (!rl.allowed) return createRateLimitResponse(rl, corsHeaders);

  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  if (!serviceKey) return json(500, { error: "Service role not configured" });

  const supa = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    switch (op) {
      // ---------------- bazi_calculations ----------------
      case "list_calculations": {
        const limit = Math.min(Number(payload.limit ?? 10) || 10, 50);
        const { data, error } = await supa
          .from("bazi_calculations")
          .select("id, name, birth_date, birth_time, gender, location, hour_branch, created_at")
          .eq("user_email", rawEmail)
          .order("created_at", { ascending: false })
          .limit(limit);
        if (error) throw error;
        return json(200, { data });
      }
      case "delete_calculation": {
        const id = String(payload.id ?? "");
        if (!id) return json(400, { error: "Missing id" });
        const { error } = await supa
          .from("bazi_calculations")
          .delete()
          .eq("id", id)
          .eq("user_email", rawEmail);
        if (error) throw error;
        return json(200, { ok: true });
      }

      // ---------------- legion_stories ----------------
      case "get_stories": {
        const calcId = String(payload.calculation_id ?? "");
        if (!calcId) return json(400, { error: "Missing calculation_id" });
        const { data, error } = await supa
          .from("legion_stories")
          .select("id, legion_type, story, is_locked, version, created_at")
          .eq("calculation_id", calcId)
          .eq("user_email", rawEmail)
          .order("legion_type");
        if (error) throw error;
        return json(200, { data });
      }
      case "save_stories": {
        const calcId = String(payload.calculation_id ?? "");
        const stories = payload.stories as Record<string, string> | undefined;
        if (!calcId || !stories || typeof stories !== "object") {
          return json(400, { error: "Missing calculation_id or stories" });
        }
        // Block if any locked story already exists
        const { data: existing, error: exErr } = await supa
          .from("legion_stories")
          .select("id, is_locked")
          .eq("calculation_id", calcId)
          .eq("user_email", rawEmail);
        if (exErr) throw exErr;
        if ((existing ?? []).some((r) => r.is_locked)) {
          return json(409, { error: "Stories already locked" });
        }
        const rows = Object.entries(stories).map(([legion_type, story]) => ({
          calculation_id: calcId,
          user_email: rawEmail,
          legion_type,
          story,
          is_locked: true,
          version: 1,
        }));
        const { error } = await supa.from("legion_stories").insert(rows);
        if (error) throw error;
        return json(200, { ok: true });
      }
      case "delete_stories": {
        const calcId = String(payload.calculation_id ?? "");
        if (!calcId) return json(400, { error: "Missing calculation_id" });
        const { error } = await supa
          .from("legion_stories")
          .delete()
          .eq("calculation_id", calcId)
          .eq("user_email", rawEmail);
        if (error) throw error;
        return json(200, { ok: true });
      }

      // ---------------- story_regeneration_credits ----------------
      case "get_credits": {
        const { data, error } = await supa
          .from("story_regeneration_credits")
          .select("credits_remaining, total_credits_purchased")
          .eq("user_email", rawEmail)
          .maybeSingle();
        if (error) throw error;
        return json(200, { data });
      }
      case "update_credits": {
        const credits = Number(payload.credits_remaining);
        if (!Number.isFinite(credits) || credits < 0) {
          return json(400, { error: "Invalid credits_remaining" });
        }
        const { error } = await supa
          .from("story_regeneration_credits")
          .update({ credits_remaining: credits, updated_at: new Date().toISOString() })
          .eq("user_email", rawEmail);
        if (error) throw error;
        return json(200, { ok: true });
      }

      default:
        return json(400, { error: `Unknown op: ${op}` });
    }
  } catch (err) {
    console.error("[bazi-data] error", op, err);
    return json(500, { error: err instanceof Error ? err.message : "Internal error" });
  }
});