import { createServerClient } from "@/lib/supabase/server";
import { jsonOk, jsonError } from "@/lib/api-helpers";
import type { User, SyncResult } from "@/lib/types";

export async function POST() {
  try {
    const supabase = createServerClient();

    const { data: unsyncedUsers, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .is("synced_at", null);

    if (fetchError) return jsonError(fetchError.message);
    if (!unsyncedUsers?.length) {
      return jsonOk<SyncResult>({ synced_count: 0, synced_users: [] });
    }

    await new Promise((r) => setTimeout(r, 1500));

    const ids = unsyncedUsers.map((u) => u.id);
    const { data: syncedUsers, error: updateError } = await supabase
      .from("users")
      .update({ synced_at: new Date().toISOString() })
      .in("id", ids)
      .select();

    if (updateError) return jsonError(updateError.message);

    return jsonOk<SyncResult>({
      synced_count: syncedUsers?.length ?? 0,
      synced_users: (syncedUsers as User[]) ?? [],
    });
  } catch {
    return jsonError("Internal server error");
  }
}
