import { currentUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  const user = await currentUser();
  if (!user) return jsonError("Kirish talab qilinadi.", 401);
  return Response.json({ user });
}
