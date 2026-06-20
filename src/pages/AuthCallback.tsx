import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * /auth/callback 已棄用。
 * 主站目前僅提供 Entitlement Lookup API，沒有 SSO token 回傳機制。
 * 此頁僅作向後相容；直接導回 /auth 讓使用者輸入 email 識別。
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/auth", { replace: true });
  }, [navigate]);
  return null;
}