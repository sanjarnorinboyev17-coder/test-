import { UserRole } from "@prisma/client";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const questionSchema = z.object({
  text: z.string().trim().min(3).max(1000),
  options: z.array(z.string().trim().min(1).max(200)).length(4),
  correctIndex: z.number().int().min(0).max(3),
  xp: z.number().int().min(1).max(100).default(10),
});

async function ownedTest(id: string, ownerId: string) {
  return prisma.test.findFirst({ where: { id, ownerId }, select: { id: true } });
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user || user.role !== UserRole.TEACHER) return jsonError("Ustoz hisobi talab qilinadi.", 401);
  const test = await prisma.test.findFirst({ where: { id: params.id, ownerId: user.id }, include: { questions: { orderBy: { order: "asc" }, select: { id: true, text: true, options: true, correctIndex: true, xp: true, order: true } } } });
  if (!test) return jsonError("Test topilmadi.", 404);
  return Response.json({ test });
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user || user.role !== UserRole.TEACHER) return jsonError("Ustoz hisobi talab qilinadi.", 401);
  try {
    const input = questionSchema.parse(await readJson(request));
    if (!(await ownedTest(params.id, user.id))) return jsonError("Test topilmadi.", 404);
    const last = await prisma.question.aggregate({ where: { testId: params.id }, _max: { order: true } });
    const question = await prisma.question.create({ data: { ...input, testId: params.id, order: (last._max.order ?? 0) + 1 } });
    return Response.json({ question }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return jsonError("Savol, 4 ta javob varianti va to‘g‘ri javobni tekshiring.", 400);
    return jsonError(error instanceof Error ? error.message : "Savol saqlanmadi.", 400);
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user || user.role !== UserRole.TEACHER) return jsonError("Ustoz hisobi talab qilinadi.", 401);
  try {
    const { questionId } = z.object({ questionId: z.string().min(1) }).parse(await readJson(request));
    if (!(await ownedTest(params.id, user.id))) return jsonError("Test topilmadi.", 404);
    const result = await prisma.question.deleteMany({ where: { id: questionId, testId: params.id } });
    if (!result.count) return jsonError("Savol topilmadi.", 404);
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) return jsonError("Savol identifikatori noto‘g‘ri.", 400);
    return jsonError("Savolni o‘chirib bo‘lmadi.", 400);
  }
}
