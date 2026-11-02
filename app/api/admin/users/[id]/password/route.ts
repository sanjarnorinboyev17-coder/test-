import bcrypt from "bcryptjs";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { enforceSameOrigin, jsonError, rateLimit, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
const schema = z.object({ password: z.string().min(12).max(128) });

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!enforceSameOrigin(request)) return jsonError("So‘rov manbasi tekshiruvdan o‘tmadi.", 403);
  const admin = await currentUser();
  if (!admin) return jsonError("Kirish talab qilinadi.", 401);
  if (admin.role !== "ADMIN") return jsonError("Bu amal faqat admin uchun.", 403);
  const limit = rateLimit(request, `admin-password:${admin.id}`, 10);
  if (!limit.allowed) return Response.json({ error: "Juda ko‘p urinish." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });

  let input;
  try { input = schema.parse(await readJson(request)); }
  catch (error) {
    if (error instanceof z.ZodError) return jsonError(error.issues[0]?.message || "Parol noto‘g‘ri.", 400);
    return jsonError(error instanceof Error ? error.message : "Noto‘g‘ri so‘rov.", 400);
  }
  try {
    const updated = await prisma.user.update({ where: { id: params.id }, data: { passwordHash: await bcrypt.hash(input.password, 12), sessionVersion: { increment: 1 } }, select: { id: true, username: true } });
    return Response.json({ user: updated });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") return jsonError("Foydalanuvchi topilmadi.", 404);
    console.error("Admin password update failed", error);
    return jsonError("Parolni yangilashda xatolik yuz berdi.", 500);
  }
}
