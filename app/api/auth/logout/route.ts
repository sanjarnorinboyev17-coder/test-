import { clearSession } from "@/lib/auth";
import { enforceSameOrigin, jsonError } from "@/lib/http";

export async function POST(request: Request) {
  if (!enforceSameOrigin(request)) return jsonError("So‘rov manbasi tekshiruvdan o‘tmadi.", 403);
  await clearSession();
  return Response.json({ ok: true });
}
