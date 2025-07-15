// src/components/ProtectedRoute.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
      } else {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  if (loading) return <div className="text-center mt-10">Checking login...</div>;

  return <>{children}</>;
};
