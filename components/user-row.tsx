"use client";

import { useEffect, useState } from "react";
import type { User } from "@/lib/types";
import { SyncStatusBadge } from "./sync-status-badge";
import { Spinner } from "./spinner";

interface UserRowProps {
  user: User;
  onSync: (id: string) => void;
  isSyncing: boolean;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function UserRow({ user, onSync, isSyncing, onDelete, isDeleting }: UserRowProps) {
  // "Adjusting state during render" pattern (recommended by React docs)
  const [prevSyncedAt, setPrevSyncedAt] = useState(user.synced_at);
  const [justSynced, setJustSynced] = useState(false);

  if (prevSyncedAt !== user.synced_at) {
    setPrevSyncedAt(user.synced_at);
    if (!prevSyncedAt && user.synced_at) {
      setJustSynced(true);
    }
  }

  useEffect(() => {
    if (justSynced) {
      const timer = setTimeout(() => setJustSynced(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [justSynced]);

  const busy = isSyncing || isDeleting;

  return (
    <tr
      className={`border-b border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all duration-500 ${
        justSynced ? "animate-sync-flash" : ""
      }`}
    >
      <td className="px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {user.name}
      </td>
      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
        {user.email}
      </td>
      <td className="px-4 py-3">
        <div className={justSynced ? "animate-badge-in" : ""}>
          <SyncStatusBadge syncedAt={user.synced_at} />
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="inline-flex items-center gap-2">
          {!user.synced_at && (
            <ActionBtn color="blue" onClick={() => onSync(user.id)} loading={isSyncing} disabled={busy}>
              {isSyncing ? "Syncing…" : "Sync"}
            </ActionBtn>
          )}
          <ActionBtn color="red" onClick={() => onDelete(user.id)} loading={isDeleting} disabled={busy}>
            {isDeleting ? "Deleting…" : "Delete"}
          </ActionBtn>
        </div>
      </td>
    </tr>
  );
}

// ─── Tiny reusable row-action button ─────────────────────
const colorMap = {
  blue: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
  amber: "bg-amber-500 hover:bg-amber-600 focus:ring-amber-400",
  red: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
} as const;

function ActionBtn({
  color,
  onClick,
  loading,
  disabled,
  children,
}: {
  color: keyof typeof colorMap;
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-w-20 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${colorMap[color]}`}
    >
      {loading && <Spinner className="h-3.5 w-3.5" />}
      {children}
    </button>
  );
}
