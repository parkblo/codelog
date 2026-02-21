import { UserAuth } from "@/shared/types/types";

/**
 * 인증에 필요한 기본 자격 증명 정보입니다.
 */
export interface AuthCredentials {
  /** 사용자의 이메일 주소 */
  email: string;
  /** 사용자의 비밀번호 */
  password: string;
  [key: string]: unknown;
}

/**
 * OAuth 인증 시 사용할 옵션입니다.
 */
export interface OAuthOptions {
  /** 인증 성공 후 리다이렉트할 URL */
  redirectTo?: string;
  [key: string]: unknown;
}

/**
 * 회원가입 시 필요한 사용자 상세 정보입니다.
 */
export interface SignUpProps extends AuthCredentials {
  /** 사용자 프로필 메타데이터 */
  data: {
    /** 고유 사용자 ID (@username) */
    user_name: string;
    /** 표시될 닉네임 */
    nick_name: string;
    /** 아바타 이미지 URL */
    avatar_url: string;
    [key: string]: unknown;
  };
}

export type GetCurrentUserFn = () => Promise<UserAuth | null>;
