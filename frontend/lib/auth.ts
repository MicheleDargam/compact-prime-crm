import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export async function getUserEmail(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get("crm_session")?.value;
  if (!token) return null;
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.email ?? null;
}
