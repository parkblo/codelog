"use client";

import { UserAuth } from "@/types/types";
import { mapSupabaseUserToDomainUser } from "@/utils/auth-mapper";
import { createClient } from "@/utils/supabase/client";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: UserAuth | null;
  loading: boolean;
  updateUser: (user: UserAuth | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  updateUser: () => {},
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

  const updateUser = (newUser: UserAuth | null) => {
    setUser(newUser);
  };

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(mapSupabaseUserToDomainUser(session.user));
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
    <AuthContext.Provider value={{ user, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
