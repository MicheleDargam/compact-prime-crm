import { NextRequest } from "next/server";

export async function getUserEmail(request: NextRequest): Promise<string | null> {
  try {
    const token = request.cookies.get("crm_session")?.value;
    if (!token) return null;
    const payload = token.split(".")[1];
    if (!payload) return null;
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    return decoded.email ?? null;
  } catch {
    return null;
  }
}
