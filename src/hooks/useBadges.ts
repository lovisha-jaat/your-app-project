import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/types/finance";

export function useBadges() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["badges", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("badges").select("*");
      if (error) throw error;
      return data as Badge[];
    },
    enabled: !!user,
  });

  const earnBadge = useMutation({
    mutationFn: async (badge_name: string) => {
      const { error } = await supabase
        .from("badges")
        .upsert({ badge_name, user_id: user!.id }, { onConflict: "user_id,badge_name" });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["badges"] }),
  });

  return { badges: query.data ?? [], isLoading: query.isLoading, earnBadge };
}
