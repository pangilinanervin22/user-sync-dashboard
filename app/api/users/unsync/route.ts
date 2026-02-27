import { createServerClient } from "@/lib/supabase/server";
import { jsonOk, jsonError } from "@/lib/api-helpers";
import type { User, SyncResult } from "@/lib/types";

export async function POST() {
  try {
    const supabase = createServerClient();

    const { data: syncedUsers, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .not("synced_at", "is", null);

    if (fetchError) return jsonError(fetchError.message);
    if (!syncedUsers?.length) {
      return jsonOk<SyncResult>({ synced_count: 0, synced_users: [] });
    }

    await new Promise((r) => setTimeout(r, 600));

    const ids = syncedUsers.map((u) => u.id);
    const { data: unsyncedUsers, error: updateError } = await supabase
      .from("users")
      .update({ synced_at: null })
      .in("id", ids)
      .select();

    if (updateError) return jsonError(updateError.message);

    return jsonOk<SyncResult>({
      synced_count: unsyncedUsers?.length ?? 0,
      synced_users: (unsyncedUsers as User[]) ?? [],
    });
  } catch {
    return jsonError("Internal server error");
  }
}
