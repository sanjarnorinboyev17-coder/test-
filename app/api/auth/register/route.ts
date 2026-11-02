import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { z } from "zod";
import { createSession, isAuthConfigured, roleHome } from "@/lib/auth";
import { enforceSameOrigin, jsonError, rateLimit, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
const schema = z.object({
  username: z.string().trim().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/, "Login faqat lotin harflari, raqam va _ dan tuzilsin."),
  password: z.string().min(12).max(128),
  role: z.enum([UserRole.TEACHER, UserRole.STUDENT]),
});

export async function POST(request: Request) {
  if (!enforceSameOrigin(request)) return jsonError("So‘rov manbasi tekshiruvdan o‘tmadi.", 403);
  if (!isAuthConfigured()) return jsonError("Server sessiya sozlamasi tayyor emas.", 500);
  const limit = rateLimit(request, "register", 5);
  if (!limit.allowed) return Response.json({ error: "Juda ko‘p urinish. Birozdan so‘ng qayta urinib ko‘ring." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });

  let input;
  try { input = schema.parse(await readJson(request)); }
  catch (error) {
    if (error instanceof z.ZodError) return jsonError(error.issues[0]?.message || "Kiritilgan ma’lumotni tekshiring.", 400);
    return jsonError(error instanceof Error ? error.message : "Noto‘g‘ri so‘rov.", 400);
  }

  try {
    const exists = await prisma.user.findUnique({ where: { username: input.username }, select: { id: true } });
    if (exists) return jsonError("Bu login band. Boshqa login tanlang.", 409);
    const title = await prisma.title.findUnique({ where: { name: "Yangi" }, select: { id: true } });
    const user = await prisma.user.create({
      data: { username: input.username, passwordHash: await bcrypt.hash(input.password, 12), role: input.role, titleId: title?.id },
      select: { id: true, username: true, role: true, sessionVersion: true },
    });
    await createSession(user);
    const { sessionVersion: _sessionVersion, ...safeUser } = user;
    return Response.json({ user: safeUser, redirectTo: await roleHome(user.role) }, { status: 201 });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") return jsonError("Bu login band. Boshqa login tanlang.", 409);
    console.error("Registration failed", error);
    return jsonError("Ro‘yxatdan o‘tish vaqtida xatolik yuz berdi.", 500);
  }
}
