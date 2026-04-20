import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  goal_type: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  monthly_sip_required: number | null;
  created_at: string;
  updated_at: string;
}

export function useGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setGoals([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase.from("financial_goals").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setGoals((data as Goal[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const addGoal = async (g: Omit<Goal, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user) return { error: new Error("not signed in") };
    const { error } = await supabase.from("financial_goals").insert({ ...g, user_id: user.id } as any);
    if (!error) await refresh();
    return { error };
  };

  const updateGoal = async (id: string, patch: Partial<Goal>) => {
    const { error } = await supabase.from("financial_goals").update(patch as any).eq("id", id);
    if (!error) await refresh();
    return { error };
  };

  const deleteGoal = async (id: string) => {
    const { error } = await supabase.from("financial_goals").delete().eq("id", id);
    if (!error) await refresh();
    return { error };
  };

  return { goals, loading, addGoal, updateGoal, deleteGoal };
}
