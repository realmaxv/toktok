import { supabase } from "@/lib/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";

type AuthContext = {
  session: Session | null;
  isLoading: boolean;
  signOut: () => void;
};

const authContext = createContext<AuthContext>(null!);

export function AuthContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then((result) => {
      console.log(result);
      if (result.data) {
        setSession(result.data.session);
      } else {
        setSession(null);
      }
      setLoading(false);
    });

    const listener = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.data.subscription.unsubscribe();
    };
  }, []);

  const signOut = () => {
    supabase.auth.signOut();
  };

  return (
    <authContext.Provider value={{ signOut, session, isLoading: loading }}>
      {children}
    </authContext.Provider>
  );
}

export const useAuthContext = () => {
  const value = useContext(authContext);
  if (!value) {
    console.error("Heyyy, no authContext provided");
  }
  return value;
};
