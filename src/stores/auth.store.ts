import { queryOptions, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/auth.service";

export const authQueryOptions = queryOptions({
  queryKey: ['auth', 'user'] as const,
  queryFn: authService.waitForUser,
  staleTime: Infinity,
});

export const useAuthStore = () => {
  const queryClient = useQueryClient();

  const invalidateAuth = () => {
    queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
  };

  return {
    invalidateAuth,
  };
}; 