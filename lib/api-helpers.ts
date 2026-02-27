import { NextResponse } from "next/server";
import type { ApiResponse } from "@/lib/types";

/** Return a typed JSON success response */
export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json<ApiResponse<T>>({ data, error: null }, { status });
}

/** Return a typed JSON error response */
export function jsonError(message: string, status = 500) {
  return NextResponse.json<ApiResponse<null>>(
    { data: null, error: message },
    { status }
  );
}
