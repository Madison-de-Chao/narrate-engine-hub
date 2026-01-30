# 內部八字計算 API 接入說明

## 概述

`internal-bazi-api` 是專為內部產品（如尋妖記、元壹卜卦等）設計的輕量級八字計算 API。

## 端點資訊

- **URL**: `https://ncpqlfwllxkwkxcqmrdi.supabase.co/functions/v1/internal-bazi-api`
- **方法**: `POST`
- **認證**: `X-Internal-Key` Header

## 認證方式

所有請求必須在 Header 中包含內部 API Key：

```
X-Internal-Key: your-internal-api-key
```

## 請求格式

### Headers

| Header | 必填 | 說明 |
|--------|------|------|
| `Content-Type` | 是 | `application/json` |
| `X-Internal-Key` | 是 | 內部 API 密鑰 |

### Request Body

```json
{
  "year": 1990,
  "month": 5,
  "day": 15,
  "hour": 14,
  "minute": 30,
  "tzOffsetMinutesEast": 480
}
```

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `year` | number | 是 | 出生年份 (1900-2100) |
| `month` | number | 是 | 出生月份 (1-12) |
| `day` | number | 是 | 出生日期 (1-31) |
| `hour` | number | 是 | 出生小時 (0-23) |
| `minute` | number | 否 | 出生分鐘 (0-59)，預設 0 |
| `tzOffsetMinutesEast` | number | 否 | 時區偏移（分鐘），預設 480 (UTC+8) |

## 回應格式

### 成功回應 (200)

```json
{
  "success": true,
  "data": {
    "input": {
      "year": 1990,
      "month": 5,
      "day": 15,
      "hour": 14,
      "minute": 30,
      "tzOffsetMinutesEast": 480
    },
    "pillars": {
      "year": { "stem": "庚", "branch": "午" },
      "month": { "stem": "辛", "branch": "巳" },
      "day": { "stem": "甲", "branch": "寅" },
      "hour": { "stem": "辛", "branch": "未" }
    },
    "nayin": {
      "year": "路旁土",
      "month": "白蠟金",
      "day": "大溪水",
      "hour": "路旁土"
    },
    "hiddenStems": {
      "year": ["丁", "己"],
      "month": ["丙", "庚", "戊"],
      "day": ["甲", "丙", "戊"],
      "hour": ["己", "丁", "乙"]
    },
    "wuxingScores": {
      "木": 2,
      "火": 2,
      "土": 2,
      "金": 3,
      "水": 0
    },
    "yinyangRatio": {
      "yin": 4,
      "yang": 4
    },
    "tenGods": {
      "year": { "stem": "偏官", "branch": "傷官" },
      "month": { "stem": "正官", "branch": "偏財" },
      "day": { "stem": "日主", "branch": "比肩" },
      "hour": { "stem": "正官", "branch": "正財" }
    },
    "dayStem": "甲",
    "dayMaster": {
      "stem": "甲",
      "element": "木",
      "yinyang": "陽"
    }
  },
  "meta": {
    "version": "1.0.0",
    "responseTimeMs": 15
  }
}
```

### 錯誤回應

| 狀態碼 | 說明 |
|--------|------|
| 400 | 請求參數錯誤 |
| 401 | 認證失敗（缺少或無效的 API Key） |
| 405 | 不支援的 HTTP 方法 |
| 500 | 伺服器內部錯誤 |

```json
{
  "success": false,
  "error": "Missing required fields: year, month, day, hour"
}
```

## 使用範例

### cURL

```bash
curl -X POST \
  'https://ncpqlfwllxkwkxcqmrdi.supabase.co/functions/v1/internal-bazi-api' \
  -H 'Content-Type: application/json' \
  -H 'X-Internal-Key: YOUR_INTERNAL_API_KEY' \
  -d '{
    "year": 1990,
    "month": 5,
    "day": 15,
    "hour": 14,
    "minute": 30
  }'
```

### JavaScript/TypeScript

```typescript
const response = await fetch(
  'https://ncpqlfwllxkwkxcqmrdi.supabase.co/functions/v1/internal-bazi-api',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Internal-Key': process.env.INTERNAL_API_KEY,
    },
    body: JSON.stringify({
      year: 1990,
      month: 5,
      day: 15,
      hour: 14,
      minute: 30,
    }),
  }
);

const result = await response.json();

if (result.success) {
  console.log('四柱:', result.data.pillars);
  console.log('日主:', result.data.dayMaster);
  console.log('五行:', result.data.wuxingScores);
} else {
  console.error('Error:', result.error);
}
```

### Python

```python
import requests

url = 'https://ncpqlfwllxkwkxcqmrdi.supabase.co/functions/v1/internal-bazi-api'
headers = {
    'Content-Type': 'application/json',
    'X-Internal-Key': 'YOUR_INTERNAL_API_KEY'
}
payload = {
    'year': 1990,
    'month': 5,
    'day': 15,
    'hour': 14,
    'minute': 30
}

response = requests.post(url, json=payload, headers=headers)
result = response.json()

if result['success']:
    pillars = result['data']['pillars']
    print(f"年柱: {pillars['year']['stem']}{pillars['year']['branch']}")
    print(f"月柱: {pillars['month']['stem']}{pillars['month']['branch']}")
    print(f"日柱: {pillars['day']['stem']}{pillars['day']['branch']}")
    print(f"時柱: {pillars['hour']['stem']}{pillars['hour']['branch']}")
else:
    print(f"Error: {result['error']}")
```

## 資料結構說明

### 四柱 (pillars)

| 柱位 | 說明 |
|------|------|
| year | 年柱 - 根據立春判斷年份交界 |
| month | 月柱 - 根據節氣判斷月份交界 |
| day | 日柱 - 根據儒略日計算 |
| hour | 時柱 - 根據日干起時辰 |

### 納音 (nayin)

六十甲子納音五行，如「海中金」「爐中火」等。

### 藏干 (hiddenStems)

地支中隱藏的天干，用於分析八字的隱性能量。

### 五行分數 (wuxingScores)

統計八字中各五行出現的次數（天干地支各計 1 次）。

### 陰陽比例 (yinyangRatio)

統計八字中陰陽的分布。

### 十神 (tenGods)

以日干為基準計算的十神關係：
- 比肩、劫財（同我者）
- 食神、傷官（我生者）
- 偏財、正財（我剋者）
- 七殺、正官（剋我者）
- 偏印、正印（生我者）

## 注意事項

1. **節氣資料範圍**：目前支援 1950-2030 年的節氣資料，超出範圍可能影響月柱計算準確性。
2. **時區處理**：預設使用 UTC+8（台北/北京時間），如需其他時區請傳入 `tzOffsetMinutesEast`。
3. **API Key 安全**：請勿在前端代碼中暴露 API Key，僅限後端使用。
4. **速率限制**：目前無速率限制，但請合理使用避免濫用。

## 版本歷史

| 版本 | 日期 | 說明 |
|------|------|------|
| 1.0.0 | 2025-01 | 初始版本，提供基礎八字計算功能 |

## 聯絡方式

如有問題或需要擴展功能，請聯繫開發團隊。
