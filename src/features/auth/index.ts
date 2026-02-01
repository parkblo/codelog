// UI Components
export { default as AuthDialog } from "./ui/auth-dialog";
export { SignOutButton } from "./ui/sign-out-button";

// Lib (Server + Client compatible)
export { getCallbackRedirectUrl } from "./lib/get-callback-redirect-url";

// NOTE: 서버 전용 함수 (requireAuth, exchangeAuthCode)는
// import { ... } from "@/features/auth/index.server-only" 사용
