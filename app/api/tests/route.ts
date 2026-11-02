import { UserRole } from "@prisma/client";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({ title: z.string().trim().min(2).max(120) });

export async function GET() {
  const user = await currentUser();
  if (!user || user.role !== UserRole.TEACHER) return jsonError("Ustoz hisobi talab qilinadi.", 401);
  const tests = await prisma.test.findMany({
    where: { ownerId: user.id }, orderBy: { createdAt: "desc" },
    select: { id: true, title: true, createdAt: true, _count: { select: { questions: true } } },
  });
  return Response.json({ tests });
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user || user.role !== UserRole.TEACHER) return jsonError("Ustoz hisobi talab qilinadi.", 401);
  try {
    const input = createSchema.parse(await readJson(request));
    const test = await prisma.test.create({ data: { title: input.title, ownerId: user.id }, select: { id: true, title: true, createdAt: true } });
    return Response.json({ test }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return jsonError("Test nomi 2–120 belgi bo‘lishi kerak.", 400);
    return jsonError(error instanceof Error ? error.message : "Test yaratilmadi.", 400);
  }
}
