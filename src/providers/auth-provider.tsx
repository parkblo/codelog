"use client";

import { UserAuth } from "@/types/types";
import { mapSupabaseUserToDomainUser } from "@/utils/auth-mapper";
import { createClient } from "@/utils/supabase/client";
import { useSearchParams } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

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
    "login"
  );
  const searchParams = useSearchParams();

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
    if (searchParams.get("auth") === "required" && !user) {
      const timer = setTimeout(() => {
        openAuthModal("login");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams, user, openAuthModal]);

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(mapSupabaseUserToDomainUser(session.user));
        // 로그인이 성공하면 모달을 닫음
        setIsAuthModalOpen(false);
      } else {
        setUser(null);
      }
      setLoading(false);
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
      {children}
    </AuthContext.Provider>
  );
}
