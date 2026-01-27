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

/**
 * 인증(Authentication) 관련 비즈니스 로직을 처리하는 서비스 인터페이스입니다.
 */
export interface IAuthService {
  /**
   * 현재 로그인된 사용자 세션을 확인하고 사용자 정보를 가져옵니다.
   * @returns 사용자 정보 또는 null (비로그인 시)
   */
  getCurrentUser(): Promise<UserAuth | null>;

  /**
   * 소셜 로그인(OAuth)을 수행합니다.
   * @param provider OAuth 제공자 (예: 'github')
   * @param options 추가 옵션 (리다이렉트 URL 등)
   * @returns 에러 객체 (성공 시 null)
   */
  signInWithOAuth?(
    provider: string,
    options?: OAuthOptions
  ): Promise<{ error: Error | null }>;

  /**
   * 이메일과 비밀번호로 로그인을 수행합니다.
   * @param credentials 이메일과 비밀번호
   * @returns 에러 객체 (성공 시 null)
   */
  signInWithPassword?(
    credentials: AuthCredentials
  ): Promise<{ error: Error | null }>;

  /**
   * 새로운 사용자로 회원가입을 수행합니다.
   * @param credentials 회원가입에 필요한 정보
   * @returns 에러 객체 (성공 시 null)
   */
  signUp?(credentials: SignUpProps): Promise<{ error: Error | null }>;

  /**
   * 현재 사용자의 세션을 종료하고 로그아웃합니다.
   * @returns 에러 객체 (성공 시 null)
   */
  signOut?(): Promise<{ error: Error | null }>;
}
