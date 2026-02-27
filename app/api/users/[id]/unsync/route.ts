import { createServerClient } from "@/lib/supabase/server";
import { jsonOk, jsonError } from "@/lib/api-helpers";
import type { User } from "@/lib/types";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerClient();

    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !user) return jsonError("User not found", 404);
    if (!user.synced_at) return jsonOk<User>(user as User);

    await new Promise((r) => setTimeout(r, 600));

    const { data: unsyncedUser, error: updateError } = await supabase
      .from("users")
      .update({ synced_at: null })
      .eq("id", id)
      .select()
      .single();

    if (updateError) return jsonError(updateError.message);
    return jsonOk<User>(unsyncedUser as User);
  } catch {
    return jsonError("Internal server error");
  }
}
