import bcrypt from "bcryptjs";
import { z } from "zod";
import { createSession, isAuthConfigured, roleHome } from "@/lib/auth";
import { enforceSameOrigin, jsonError, rateLimit, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
const schema = z.object({ username: z.string().trim().min(1).max(32), password: z.string().min(1).max(128) });

export async function POST(request: Request) {
  if (!enforceSameOrigin(request)) return jsonError("So‘rov manbasi tekshiruvdan o‘tmadi.", 403);
  if (!isAuthConfigured()) return jsonError("Server sessiya sozlamasi tayyor emas.", 500);
  const limit = rateLimit(request, "login", 8);
  if (!limit.allowed) return Response.json({ error: "Juda ko‘p urinish. Birozdan so‘ng qayta urinib ko‘ring." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });

  let input;
  try { input = schema.parse(await readJson(request)); }
  catch (error) {
    if (error instanceof z.ZodError) return jsonError("Login yoki parol noto‘g‘ri.", 400);
    return jsonError(error instanceof Error ? error.message : "Noto‘g‘ri so‘rov.", 400);
  }

  try {
    const user = await prisma.user.findUnique({ where: { username: input.username }, select: { id: true, username: true, role: true, passwordHash: true, sessionVersion: true } });
    const matches = user ? await bcrypt.compare(input.password, user.passwordHash) : false;
    if (!user || !matches) return jsonError("Login yoki parol noto‘g‘ri.", 401);
    await createSession(user);
    return Response.json({ user: { id: user.id, username: user.username, role: user.role }, redirectTo: await roleHome(user.role) });
  } catch (error) {
    console.error("Login failed", error);
    return jsonError("Kirish vaqtida xatolik yuz berdi.", 500);
  }
}
