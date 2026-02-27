import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import type { User, ApiResponse } from "@/lib/types";

// DELETE /api/users/:id — Delete a user by ID
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerClient();

    // 1. Verify user exists
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !user) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "User not found" },
        { status: 404 }
      );
    }

    // 2. Delete the user
    const { error: deleteError } = await supabase
      .from("users")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<User>>({
      data: user as User,
      error: null,
    });
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}
