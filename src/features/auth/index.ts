// UI Components
export { default as AuthDialog } from "./ui/auth-dialog";
export { SignOutButton } from "./ui/sign-out-button";

// Lib (Server + Client compatible)
export { getCallbackRedirectUrl } from "./lib/get-callback-redirect-url";

// NOTE: exchangeAuthCode는 서버 전용이므로 Public API에서 제외
// 직접 import 사용: import { exchangeAuthCode } from "@/features/auth/api/exchange-session";
