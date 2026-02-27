import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type { User, SyncResult, ApiResponse } from "@/lib/types";

const USERS_KEY = ["users"] as const;

// ─── Fetch helper (mutations only) ──────────────────────
async function apiFetch<T>(url: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    ...(body ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}),
  });
  const json: ApiResponse<T> = await res.json();
  if (json.error) throw new Error(json.error);
  return json.data!;
}

// ─── Realtime-powered query ──────────────────────────────
export function useUsers() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: USERS_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw new Error(error.message);
      return data as User[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("users-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        (payload) => {
          qc.setQueryData<User[]>(USERS_KEY, (old) => {
            if (!old) return old;
            switch (payload.eventType) {
              case "INSERT":
                return [...old, payload.new as User];
              case "UPDATE":
                return old.map((u) =>
                  u.id === (payload.new as User).id ? (payload.new as User) : u
                );
              case "DELETE":
                return old.filter((u) => u.id !== (payload.old as { id: string }).id);
              default:
                return old;
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  return query;
}

// ─── Mutations (invalidate as fallback — realtime provides instant updates) ──
export function useSyncAll() {
  const qc = useQueryClient();
  return useMutation<SyncResult, Error>({
    mutationFn: () => apiFetch<SyncResult>("/api/users/sync", "POST"),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
}

export function useUnsyncAll() {
  const qc = useQueryClient();
  return useMutation<SyncResult, Error>({
    mutationFn: () => apiFetch<SyncResult>("/api/users/unsync", "POST"),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
}

export function useSyncUser() {
  const qc = useQueryClient();
  return useMutation<User, Error, string>({
    mutationFn: (id) => apiFetch<User>(`/api/users/${id}/sync`, "POST"),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
}

export function useUnsyncUser() {
  const qc = useQueryClient();
  return useMutation<User, Error, string>({
    mutationFn: (id) => apiFetch<User>(`/api/users/${id}/unsync`, "POST"),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation<User, Error, { name: string; email: string }>({
    mutationFn: (payload) => apiFetch<User>("/api/users", "POST", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation<User, Error, string>({
    mutationFn: (id) => apiFetch<User>(`/api/users/${id}`, "DELETE"),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
}
