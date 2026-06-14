import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/authMiddleware";

export async function GET(request: NextRequest) {
  const result = await authMiddleware(request);

  if (!result.authenticated) {
    return result.response;
  }

  return NextResponse.json({ authenticated: true });
}
