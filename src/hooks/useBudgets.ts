import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Budget } from "@/types/finance";

export function useBudgets() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["budgets", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("budgets").select("*");
      if (error) throw error;
      return data as Budget[];
    },
    enabled: !!user,
  });

  const setBudget = useMutation({
    mutationFn: async (b: { category: string; amount: number; month: number; year: number }) => {
      const { data, error } = await supabase
        .from("budgets")
        .upsert({ ...b, user_id: user!.id }, { onConflict: "user_id,category,month,year" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets"] }),
  });

  const deleteBudget = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("budgets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets"] }),
  });

  return { budgets: query.data ?? [], isLoading: query.isLoading, setBudget, deleteBudget };
}
