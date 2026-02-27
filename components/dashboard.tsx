"use client";

import { useState } from "react";
import { useUsers, useSyncAll, useSyncUser, useUnsyncUser, useCreateUser, useUnsyncAll, useDeleteUser } from "@/lib/hooks/use-users";
import { UserTable } from "@/components/user-table";
import { SyncAllButton } from "@/components/sync-all-button";
import { UnsyncAllButton } from "@/components/unsync-all-button";
import { AddUserForm } from "@/components/add-user-form";
import { Spinner } from "@/components/spinner";

export default function Dashboard() {
  const { data: users, isLoading, isError, error } = useUsers();
  const syncAll = useSyncAll();
  const syncUser = useSyncUser();
  const unsyncUser = useUnsyncUser();
  const unsyncAll = useUnsyncAll();
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();

  const [syncingUserId, setSyncingUserId] = useState<string | null>(null);
  const [unsyncingUserId, setUnsyncingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const unsyncedCount = users?.filter((u) => !u.synced_at).length ?? 0;
  const syncedCount = users?.filter((u) => !!u.synced_at).length ?? 0;

  function withLoadingId(
    setter: (id: string | null) => void,
    mutation: { mutate: (id: string, opts?: { onSettled?: () => void }) => void }
  ) {
    return (id: string) => {
      setter(id);
      mutation.mutate(id, { onSettled: () => setter(null) });
    };
  }

  const handleSyncUser = withLoadingId(setSyncingUserId, syncUser);
  const handleUnsyncUser = withLoadingId(setUnsyncingUserId, unsyncUser);
  const handleDeleteUser = withLoadingId(setDeletingUserId, deleteUser);

  if (isLoading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="h-8 w-8 text-blue-600" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading users…</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
        <p className="text-sm font-medium text-red-700 dark:text-red-400">
          Failed to load users: {error?.message ?? "Unknown error"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            User Sync Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Manage and synchronize users with the external partner system.
          </p>
        </div>
        <div className="flex gap-3">
          <SyncAllButton onClick={() => syncAll.mutate()} isSyncing={syncAll.isPending} unsyncedCount={unsyncedCount} />
          <UnsyncAllButton onClick={() => unsyncAll.mutate()} isUnsyncing={unsyncAll.isPending} syncedCount={syncedCount} />
        </div>
      </div>

      {/* Feedback banners */}
      <StatusBanner show={syncAll.isSuccess} variant="success">
        Successfully synced {syncAll.data?.synced_count} user(s).
      </StatusBanner>
      <StatusBanner show={syncAll.isError} variant="error">
        Sync failed: {syncAll.error?.message}
      </StatusBanner>
      <StatusBanner show={unsyncAll.isSuccess} variant="success">
        Successfully unsynced {unsyncAll.data?.synced_count} user(s).
      </StatusBanner>
      <StatusBanner show={unsyncAll.isError} variant="error">
        Unsync failed: {unsyncAll.error?.message}
      </StatusBanner>

      {/* Table */}
      <UserTable
        users={users ?? []}
        onSyncUser={handleSyncUser}
        syncingUserId={syncingUserId}
        onDeleteUser={handleDeleteUser}
        deletingUserId={deletingUserId}
      />

      {/* Add user */}
      <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
        <AddUserForm onSubmit={(d) => createUser.mutate(d)} isSubmitting={createUser.isPending} />
        {createUser.isError && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{createUser.error?.message}</p>
        )}
      </div>
    </div>
  );
}

// ─── Inline feedback banner ──────────────────────────────
function StatusBanner({ show, variant, children }: { show: boolean; variant: "success" | "error"; children: React.ReactNode }) {
  if (!show) return null;
  const styles =
    variant === "success"
      ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400"
      : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400";
  return <div className={`rounded-lg border px-4 py-3 text-sm ${styles}`}>{children}</div>;
}
