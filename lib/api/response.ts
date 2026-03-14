import { NextResponse } from "next/server";
import type { ApiErrorResponse, ApiSuccessResponse } from "@/types/api";

export function ok<T>(data: T, meta?: Record<string, unknown>) {
  const body: ApiSuccessResponse<T> = { success: true, data, ...(meta ? { meta } : {}) };
  return NextResponse.json(body, { status: 200 });
}

export function created<T>(data: T) {
  const body: ApiSuccessResponse<T> = { success: true, data };
  return NextResponse.json(body, { status: 201 });
}

export function error(status: number, code: string, message: string, details?: unknown) {
  const body: ApiErrorResponse = { success: false, error: { code, message, details } };
  return NextResponse.json(body, { status });
}
