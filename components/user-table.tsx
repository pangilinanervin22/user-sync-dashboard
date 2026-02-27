"use client";

import { useState, useMemo } from "react";
import type { User } from "@/lib/types";
import { UserRow } from "./user-row";

type SortDir = "asc" | "desc";

interface UserTableProps {
  users: User[];
  onSyncUser: (id: string) => void;
  syncingUserId: string | null;
  onDeleteUser: (id: string) => void;
  deletingUserId: string | null;
}

export function UserTable({ users, onSyncUser, syncingUserId, onDeleteUser, deletingUserId }: UserTableProps) {
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const sortedUsers = useMemo(
    () =>
      [...users].sort((a, b) =>
        sortDir === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      ),
    [users, sortDir]
  );

  if (users.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No users found. Add some users to get started.
        </p>
      </div>
    );
  }

  const unsyncedCount = users.filter((u) => !u.synced_at).length;
  const syncedCount = users.filter((u) => u.synced_at).length;

  return (
    <div className="space-y-3">
      {/* Stats strip */}
      <div className="flex gap-4 text-sm text-zinc-500 dark:text-zinc-400">
        <span>
          Total: <strong className="text-zinc-900 dark:text-zinc-100">{users.length}</strong>
        </span>
        <span>
          Synced: <strong className="text-green-600 dark:text-green-400">{syncedCount}</strong>
        </span>
        <span>
          Pending: <strong className="text-amber-600 dark:text-amber-400">{unsyncedCount}</strong>
        </span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 dark:bg-zinc-800">
            <tr>
              <th
                className="cursor-pointer select-none px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
              >
                Name {sortDir === "asc" ? "▲" : "▼"}
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Email
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-700 dark:bg-zinc-900">
            {sortedUsers.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                onSync={onSyncUser}
                isSyncing={syncingUserId === user.id}
                onDelete={onDeleteUser}
                isDeleting={deletingUserId === user.id}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
