/**
 * 서버 전용 인증 기능
 *
 * 이 모듈의 함수들은 서버 컴포넌트, 서버 액션, Route Handler에서만 사용 가능합니다.
 * 클라이언트 컴포넌트에서 import 시 빌드 에러가 발생합니다.
 */
import "server-only";

export { exchangeAuthCode } from "./api/exchange-session";
export { requireAuth } from "./api/require-auth";
