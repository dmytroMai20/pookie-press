import { NextRequest, NextResponse } from "next/server";
import type { AuthPort, AuthTokenPayload } from "@/ports/AuthPort";
import { getAuthAdapter } from "@/lib/container";

const COOKIE_NAME = "admin_token";

export async function authMiddleware(
  request: NextRequest,
  auth?: AuthPort
): Promise<{ authenticated: true; payload: AuthTokenPayload } | { authenticated: false; response: NextResponse }> {
  const adapter = auth ?? getAuthAdapter();
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return {
      authenticated: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const payload = await adapter.verifyToken(token);

  if (!payload) {
    return {
      authenticated: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { authenticated: true, payload };
}
