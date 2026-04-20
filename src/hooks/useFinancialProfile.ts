import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import type { FinancialProfile } from "@/lib/finance";

export type ProfileRow = FinancialProfile & { id: string; user_id: string; created_at: string; updated_at: string };

export function useFinancialProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("financial_profile")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!error) setProfile(data as ProfileRow | null);
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const upsert = useCallback(async (data: Partial<FinancialProfile>) => {
    if (!user) return { error: new Error("not signed in") };
    const payload = { ...data, user_id: user.id, age: data.age ?? 30 };
    const { error } = await supabase
      .from("financial_profile")
      .upsert(payload as any, { onConflict: "user_id" });
    if (!error) await refresh();
    return { error };
  }, [user, refresh]);

  return { profile, loading, upsert, refresh };
}
