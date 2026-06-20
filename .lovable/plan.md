## 目標
- 本網站不再做真正登入。使用者只輸入 email 作為「身份識別」。
- Premium 權限完全由主站 `check-entitlement` (x-api-key) 決定。
- 本地表格 (`bazi_calculations`, `legion_stories`, `story_regeneration_credits`, `profiles`) 改以 email 為 key 儲存。

## 風險告知（採用 C 方案的代價）
- 任何人輸入別人的 email 都能看到該 email 的歷史紀錄。
- 無法防止冒用，僅作為「個人收藏」用途。已和你確認接受。

## 實作步驟

### 1. 機密設定
- 新增 secret：`CENTRAL_API_KEY`（主站 mdc_… 完整 key）。
- `CENTRAL_PRODUCT_ID` 寫在 Edge Function 常數：`22222222-2222-2222-2222-222222222222`。

### 2. 新 Edge Function：`central-entitlement`
- 前端傳 email → 後端用 x-api-key 呼叫主站 `check-entitlement` → 回傳 `{ hasAccess, entitlement }`。
- 加入 60 秒快取（in-memory）以節省 quota。
- 設 `verify_jwt = false`（本網站無 JWT）。

### 3. 前端身份層改寫
- 新 hook `useIdentity()`：從 `localStorage('user_email')` 讀 email；提供 `setEmail`, `clearEmail`。
- 新元件 `IdentityGate`：未填 email 時顯示 email 輸入框（zod 驗證）。
- 改寫 `useUnifiedMembership`：以 `useIdentity()` 取 email，呼叫 `central-entitlement`。
- 移除/封存：`Auth.tsx` 登入登出頁、`AuthCallback.tsx`、`/auth/reset-password`、`useRateLimitedAuth`、Google OAuth、`signOut` 改為「清除身份」。

### 4. 資料表調整（Migration）
- 新增 `bazi_calculations.user_email TEXT`、`legion_stories.user_email TEXT`、`story_regeneration_credits.user_email TEXT`。
- 為相容歷史資料保留 `user_id` 欄位但不再強制；新寫入只填 email。
- RLS 策略放寬：以 email 為查詢條件（前端附帶）。**註：因為無 JWT，RLS 無法真正鎖定，policy 改為 `USING (true)`，由前端控管。**
- GRANT `anon` `SELECT, INSERT, UPDATE, DELETE` 於上述三表。

### 5. 棄用清單
- `subscriptions`, `user_roles`, `login_attempts`, `auth-rate-limit`, `record_login_attempt` 等本地會員/防護機制 → 邊緣函式仍保留但前端不再呼叫。
- `profiles` 表保留作為 email→display_name 的對照（自願填寫）。

### 6. 後續驗證
- 首次造訪 / 已存 email：直接進主頁。
- 輸入 email → 計算八字 → 紀錄存檔（以 email key）→ 重新整理仍能看到。
- Premium email：上鎖內容解鎖 (Academy, Full Report)。
- 非 Premium：顯示「升級」按鈕導向主站訂閱頁。

## 需要你提供
1. 確認 secret 名稱 `CENTRAL_API_KEY` ok，並把完整 key 給我（透過 add_secret 流程）。
2. 確認主站訂閱頁 URL（先沿用 `https://story-builder-hub.lovable.app/subscribe`）。

確認後我開始實作。
