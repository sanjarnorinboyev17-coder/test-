import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE = "bilim_arena_session";
const SESSION_SECONDS = 60 * 60 * 24 * 7;

export function isAuthConfigured() {
  return Boolean(process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 32);
}

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!isAuthConfigured() || !secret) throw new Error("AUTH_SECRET kamida 32 belgidan iborat bo‘lishi kerak.");
  return new TextEncoder().encode(secret);
}

export async function createSession(user: { id: string; role: UserRole; sessionVersion: number }) {
  const token = await new SignJWT({ role: user.role, sv: user.sessionVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_SECONDS}s`)
    .sign(secretKey());

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export async function clearSession() {
  cookies().set(SESSION_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
}

export async function readSession(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (typeof payload.sub !== "string" || !Object.values(UserRole).includes(payload.role as UserRole)) return null;
    if (typeof payload.sv !== "number") return null;
    return { userId: payload.sub, role: payload.role as UserRole, sessionVersion: payload.sv };
  } catch {
    return null;
  }
}

export async function currentUser() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await readSession(token);
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, username: true, role: true, xp: true, createdAt: true, sessionVersion: true, title: { select: { name: true } } },
  });
  if (!user || user.sessionVersion !== session.sessionVersion) return null;
  const { sessionVersion: _sessionVersion, ...safeUser } = user;
  return safeUser;
}

export async function roleHome(role: UserRole) {
  switch (role) {
    case UserRole.ADMIN: return "/admin";
    case UserRole.TEACHER: return "/teacher";
    default: return "/student";
  }
}
