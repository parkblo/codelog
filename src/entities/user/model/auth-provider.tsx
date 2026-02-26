"use client";

import {
  Suspense,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";

import * as Sentry from "@sentry/nextjs";

import {
  getUserProfileById,
  subscribeToAuthStateChanges,
} from "@/shared/lib/database/client";
import {
  captureEvent,
  identifyPostHogUser,
  resetPostHogUser,
} from "@/shared/lib/posthog";
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

  const activeUserId = useRef<string | null>(initialUser?.id ?? null);

  const updateUser = (newUser: UserAuth | null) => {
    activeUserId.current = newUser?.id ?? null;
    setUser(newUser);
    setLoading(false);
  };

  const openAuthModal = useCallback((view: "login" | "signup" = "login") => {
    setAuthModalView(view);
    setIsAuthModalOpen(true);
    captureEvent("auth_modal_opened", { view });
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    captureEvent("auth_modal_closed");
  }, []);

  useEffect(() => {
    if (user) {
      identifyPostHogUser(user.id, {
        username: user.username,
        nickname: user.nickname,
      });
      Sentry.setUser({
        id: user.id,
        username: user.username,
      });
      return;
    }

    resetPostHogUser();
    Sentry.setUser(null);
  }, [user]);

  useEffect(() => {
    const unsubscribe = subscribeToAuthStateChanges((currentUserId) => {
      const previousUserId = activeUserId.current;
      activeUserId.current = currentUserId;

      if (!currentUserId) {
        setUser(null);
        setLoading(false);
        setIsAuthModalOpen(false);
        return;
      }

      if (previousUserId === currentUserId) {
        setIsAuthModalOpen(false);
        return;
      }

      setLoading(true);
      getUserProfileById(currentUserId).then(({ data: profile, error }) => {
        if (activeUserId.current === currentUserId) {
          if (profile && !error) {
            setUser(profile);
          } else {
            setUser(null);
          }
          setLoading(false);
        }
      });

      setIsAuthModalOpen(false);
    });

    return () => {
      unsubscribe();
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
 * URL 쿼리 문자열(auth=required)을 감지해 인증 모달을 여는 하위 컴포넌트입니다.
 */
function AuthModalTrigger() {
  const searchParams = useSearchParams();
  const { user, openAuthModal } = useAuth();
  const isAuthRequired = searchParams?.get("auth") === "required";

  useEffect(() => {
    if (user || !isAuthRequired) {
      return;
    }

    const timer = setTimeout(() => {
      openAuthModal("login");
    }, 0);
    return () => clearTimeout(timer);
  }, [isAuthRequired, user, openAuthModal]);

  return null;
}
