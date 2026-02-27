import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { User, SyncResult, ApiResponse } from "@/lib/types";

const USERS_KEY = ["users"] as const;

// ─── Shared fetch helper ─────────────────────────────────
async function apiFetch<T>(url: string, method = "GET", body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    ...(body ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}),
  });
  const json: ApiResponse<T> = await res.json();
  if (json.error) throw new Error(json.error);
  return json.data!;
}

// ─── Shared mutation hook factory ────────────────────────
function useInvalidatingMutation<TArgs = void, TData = unknown>(
  mutationFn: (args: TArgs) => Promise<TData>
) {
  const qc = useQueryClient();
  return useMutation<TData, Error, TArgs>({
    mutationFn,
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
}

// ─── Hooks ───────────────────────────────────────────────
export function useUsers() {
  return useQuery({
    queryKey: USERS_KEY,
    queryFn: () => apiFetch<User[]>("/api/users"),
  });
}

export function useSyncAll() {
  return useInvalidatingMutation<void, SyncResult>(() => apiFetch<SyncResult>("/api/users/sync", "POST"));
}

export function useUnsyncAll() {
  return useInvalidatingMutation<void, SyncResult>(() => apiFetch<SyncResult>("/api/users/unsync", "POST"));
}

export function useSyncUser() {
  return useInvalidatingMutation((id: string) => apiFetch<User>(`/api/users/${id}/sync`, "POST"));
}

export function useUnsyncUser() {
  return useInvalidatingMutation((id: string) => apiFetch<User>(`/api/users/${id}/unsync`, "POST"));
}

export function useCreateUser() {
  return useInvalidatingMutation((payload: { name: string; email: string }) =>
    apiFetch<User>("/api/users", "POST", payload)
  );
}

export function useDeleteUser() {
  return useInvalidatingMutation((id: string) => apiFetch<User>(`/api/users/${id}`, "DELETE"));
}
