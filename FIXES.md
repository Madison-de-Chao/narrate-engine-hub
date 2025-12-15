# 修復記錄

## 修復日期：2025-12-15

### 問題 1：時間選擇器黑畫面問題

**問題描述：**
用戶回報選擇時間時會出現黑畫面。

**根因分析：**
1. SelectContent 使用 Radix UI 的 Portal 渲染機制，將下拉選單渲染到 body 元素
2. 原本的 z-index 設定為 `z-50`，可能與其他元素產生層級衝突
3. 下拉選單可能被其他元素遮蔽，導致視覺上看起來像黑畫面

**修復方案：**
- 檔案：`src/components/BaziInputForm.tsx`
- 修改內容：
  - 移除 SelectTrigger 的 `z-50` 類別（不需要）
  - 將 SelectContent 的 z-index 從 `z-50` 提升至 `z-[9999]`
  - 確保下拉選單在所有元素的最上層顯示

**修改前：**
```tsx
<SelectTrigger className="bg-input border-border text-foreground z-50">
  <SelectValue placeholder="請選擇時辰" />
</SelectTrigger>
<SelectContent className="bg-popover border-border z-50 max-h-[300px]">
```

**修改後：**
```tsx
<SelectTrigger className="bg-input border-border text-foreground">
  <SelectValue placeholder="請選擇時辰" />
</SelectTrigger>
<SelectContent className="bg-popover border-border max-h-[300px] z-[9999]">
```

---

### 問題 2：簡體字錯誤

**問題描述：**
專案中存在多處簡體字，應統一使用繁體中文。

**修復方案：**

#### 2.1 BaziInputForm.tsx
- 檔案：`src/components/BaziInputForm.tsx`
- 修改內容：
  - 註解：`时辰选项（子时到亥时）` → `時辰選項（子時到亥時）`
  - 時辰選項標籤：所有 `时` 改為 `時`（子时→子時、丑时→丑時 等共12處）

**修改清單：**
- 子时 → 子時
- 丑时 → 丑時
- 寅时 → 寅時
- 卯时 → 卯時
- 辰时 → 辰時
- 巳时 → 巳時
- 午时 → 午時
- 未时 → 未時
- 申时 → 申時
- 酉时 → 酉時
- 戌时 → 戌時
- 亥时 → 亥時

#### 2.2 BaziTest.tsx
- 檔案：`src/pages/BaziTest.tsx`
- 修改內容：測試案例和 UI 文字的簡繁轉換

**測試案例名稱：**
- 标准测试1/2/3 → 標準測試1/2/3
- 年柱换年边界 → 年柱換年邊界
- 子时跨日A/B → 子時跨日A/B
- 时支边界-戌时/亥时 → 時支邊界-戌時/亥時

**測試案例註解：**
- 立春后应切换到甲子年 → 立春後應切換到甲子年
- 时支必为子，日柱应为次日 → 時支必為子，日柱應為次日
- 时支仍为子，日柱为次日 → 時支仍為子，日柱為次日
- 19:30应为戌时 → 19:30應為戌時
- 21:10应为亥时 → 21:10應為亥時

**UI 文字：**
- 测试案例 → 測試案例
- 时柱 → 時柱
- 综合 → 綜合
- 预期 → 預期
- 未校验 → 未校驗
- 八字计算系统测试 → 八字計算系統測試
- 验证计算准确性与边界处理 → 驗證計算準確性與邊界處理
- 测试中... → 測試中...
- 运行所有测试 → 運行所有測試
- 标准测试 → 標準測試
- 系统必过样本 → 系統必過樣本
- 边界测试 → 邊界測試
- 规则守门测试 → 規則守門測試
- 标准测试结果 → 標準測試結果
- 边界测试结果 → 邊界測試結果

---

## 總結

**修復檔案數量：** 2 個檔案
- `src/components/BaziInputForm.tsx`
- `src/pages/BaziTest.tsx`

**修改類型：**
1. UI 層級問題修復（z-index 調整）
2. 文字正規化（簡體轉繁體）

**預期效果：**
1. 時間選擇器下拉選單應正常顯示，不再出現黑畫面
2. 所有介面文字統一使用繁體中文
