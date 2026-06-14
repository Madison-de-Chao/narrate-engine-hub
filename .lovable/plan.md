## 目標
本網站棄用本地認證 UI，所有登入/註冊/密碼重設都跳轉到「主站」(story_builder_hub) 執行；本地 Supabase 僅紀錄八字、軍團故事、改寫點數、profile 鏡像。權限完全以中央為準。

## 需要您先確認的關鍵資訊

中央系統是「另一個 Supabase 專案」(yyzcgxnvtprojutnxisz)，跟本站 (ncpqlfwllxkwkxcqmrdi) 的 auth.users 是分離的。要做「完全 SSO 跳轉」必須有主站配合，請告訴我：

1. **主站登入頁 URL**：例如 `https://story-builder-hub.lovable.app/auth?return_to=...`？
2. **回傳機制**：主站登入成功後，會以什麼方式把 session 交給本站？
   - (a) URL fragment 傳 `access_token` + `refresh_token`（最常見）
   - (b) 主站直接呼叫本站 callback edge function
   - (c) 共用 cookie（需同根網域，不適用）
3. **主站 Supabase 專案的 anon key**：本站需要它來呼叫 `setSession()` 並維持中央 session

若主站尚未支援回傳 token，這個功能無法單方面在本站完成。

## 改動範圍（待上述確認後執行）

### 認證層
- 刪除 `src/pages/Auth.tsx` 的 email/password/Google 表單，改為「自動跳轉主站」載入畫面
- 改寫 `src/lib/member/MemberContext.tsx`：`signIn/signUp/resetPassword/signInWithGoogle` 全部改為跳轉主站
- 新增 `/auth/callback` 路由：接收主站回傳的 token，呼叫 `supabase.auth.setSession()`，並以 email 比對/建立本地 profile
- `PageHeader` 的「登出」改為同時登出本地 + 跳轉主站登出端點
- 移除 `useRateLimitedAuth`、`auth-rate-limit` edge function（認證已不在本站發生）
- 移除 `login_attempts` 表的引用（保留資料，停止寫入）

### 會員/權限層
- `useUnifiedMembership`：刪除「本地 subscriptions fallback」分支，只信任中央 `check-entitlement` 結果
- 移除 `subscriptions` 表的客戶端讀寫（保留資料只供舊紀錄查詢）
- `Subscribe.tsx` 改為跳轉主站訂閱頁
- `PremiumGate`、`EntitlementGuard` 升級按鈕指向主站

### Profile 鏡像
- 登入後以 email 從本地 `profiles` 查找；若不存在，以中央 user_id 建立
- `bazi_calculations` / `legion_stories` / `story_regeneration_credits` 的 `user_id` 改為「中央 user_id」(已是 UUID，相容)
- 一次性 SQL：把現存本地 user_id 透過 email 對應到中央 user_id（需中央側提供 email→id 對照 API）

### 路由清理
- `/auth` → 自動 redirect 載入頁
- 移除 `/auth/reset-password`（主站處理）

### 體驗檢查（使用者要求的「全面檢視」）
完成後我會逐頁巡：Home → /bazi 計算流程 → Subscribe → /account → /admin → /academy → PDF 下載 → API Console，確認：
- 未登入時引導順暢、不會卡在白屏
- 點任何登入入口都跳主站，不再看到本地表單
- 中央會員徽章正確顯示
- 既有本地會員（已有訂閱）的舊資料仍能讀到

## 技術備註
- 不刪除本地 `subscriptions` / `login_attempts` 表（保留歷史資料，僅停寫）
- `useEntitlement`、`useMembershipStatus`、`usePremiumStatus` 為已棄用相容層，行為自動跟隨 `useUnifiedMembership`
- 「過渡計畫：自動以 email 比對」需要中央提供一支「以 email 取得中央 user_id」的 endpoint，否則本地舊資料無法續接

---

**請先回覆上方 3 個關鍵資訊（主站 URL / 回傳機制 / 中央 anon key），我再開始實作。** 沒有這些資訊，SSO 跳轉只能做半套（跳出去但接不回來）。