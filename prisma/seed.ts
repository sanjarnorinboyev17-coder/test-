import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const titles = [
    { name: "Yangi", minXp: 0 },
    { name: "Bilimdon", minXp: 500 },
    { name: "Usta", minXp: 2000 },
    { name: "Grandmaster", minXp: 5000 },
  ];

  for (const title of titles) {
    await prisma.title.upsert({ where: { name: title.name }, update: { minXp: title.minXp }, create: title });
  }

  const username = process.env.SEED_ADMIN_USERNAME?.trim();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!username || !password || password === "change-this-before-seeding") {
    throw new Error("SEED_ADMIN_USERNAME va xavfsiz SEED_ADMIN_PASSWORD ni .env faylida belgilang.");
  }
  if (password.length < 12) throw new Error("Seed admin paroli kamida 12 belgidan iborat bo‘lsin.");

  const title = await prisma.title.findUniqueOrThrow({ where: { name: "Yangi" } });
  await prisma.user.upsert({
    where: { username },
    update: { role: UserRole.ADMIN },
    create: { username, passwordHash: await bcrypt.hash(password, 12), role: UserRole.ADMIN, titleId: title.id },
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exitCode = 1;
  });
