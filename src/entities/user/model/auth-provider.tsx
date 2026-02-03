"use client";

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";

import { createClient } from "@/shared/lib";
import { UserAuth } from "@/shared/types";

interface AuthContextType {
  user: UserAuth | null;
  loading: boolean;
  updateUser: (user: UserAuth | null) => void;
  isAuthModalOpen: boolean;
  authModalView: "login" | "signup";
  openAuthModal: (view?: "login" | "signup") => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  updateUser: () => {},
  isAuthModalOpen: false,
  authModalView: "login",
  openAuthModal: () => {},
  closeAuthModal: () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export default function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: UserAuth | null;
}) {
  const [user, setUser] = useState<UserAuth | null>(initialUser);
  const [loading, setLoading] = useState(!initialUser);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<"login" | "signup">(
    "login",
  );

  const activeUserId = useRef<string | null>(null);

  const updateUser = (newUser: UserAuth | null) => {
    setUser(newUser);
  };

  const openAuthModal = useCallback((view: "login" | "signup" = "login") => {
    setAuthModalView(view);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const currentId = session?.user?.id ?? null;
      activeUserId.current = currentId;

      if (!session) {
        setUser(null);
        setLoading(false);
        setIsAuthModalOpen(false);
        return;
      }

      const userId = session.user.id;

      setLoading(true);
      supabase
        .from("users")
        .select("id, username, nickname, avatar, bio")
        .eq("id", userId)
        .single()
        .then(({ data: profile, error }) => {
          if (activeUserId.current === userId) {
            if (profile && !error) {
              setUser(profile as UserAuth);
            } else {
              setUser(null);
            }
            setLoading(false);
          }
        });

      setIsAuthModalOpen(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        updateUser,
        isAuthModalOpen,
        authModalView,
        openAuthModal,
        closeAuthModal,
      }}
    >
      <Suspense fallback={null}>
        <AuthModalTrigger />
      </Suspense>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * URL 검색 파라미터를 기반으로 인증 모달을 여는 하위 컴포넌트입니다.
 * 전체 레이아웃이 서버 사이드 렌더링에서 제외되는 것을 방지하기 위해 Suspense로 감싸서 사용합니다.
 */
function AuthModalTrigger() {
  const searchParams = useSearchParams();
  const { user, openAuthModal } = useAuth();

  useEffect(() => {
    if (searchParams?.get("auth") === "required" && !user) {
      const timer = setTimeout(() => {
        openAuthModal("login");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams, user, openAuthModal]);

  return null;
}
