import { createServerClient } from "@/lib/supabase/server";
import { jsonOk, jsonError } from "@/lib/api-helpers";
import type { User } from "@/lib/types";

export async function GET() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) return jsonError(error.message);
    return jsonOk<User[]>(data as User[]);
  } catch {
    return jsonError("Internal server error");
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerClient();
    const { name, email } = await request.json();

    if (!name || !email) return jsonError("Name and email are required", 400);

    const { data, error } = await supabase
      .from("users")
      .insert({ name, email })
      .select()
      .single();

    if (error) return jsonError(error.message);
    return jsonOk<User>(data as User, 201);
  } catch {
    return jsonError("Internal server error");
  }
}
