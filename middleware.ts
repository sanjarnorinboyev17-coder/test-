import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const protectedPages = [
  { prefix: "/admin", roles: ["ADMIN"] },
  { prefix: "/teacher", roles: ["TEACHER"] },
  { prefix: "/student", roles: ["STUDENT"] },
];
const roleLanding: Record<string, string> = { ADMIN: "/admin", TEACHER: "/teacher", STUDENT: "/student" };

async function getRole(token?: string) {
  const secret = process.env.AUTH_SECRET;
  if (!token || !secret || secret.length < 32) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ["HS256"] });
    return typeof payload.role === "string" && roleLanding[payload.role] ? payload.role : null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const role = await getRole(request.cookies.get("bilim_arena_session")?.value);
  const path = request.nextUrl.pathname;
  const protectedPage = protectedPages.find(({ prefix }) => path === prefix || path.startsWith(`${prefix}/`));

  if (protectedPage && (!role || !protectedPage.roles.includes(role))) {
    const destination = request.nextUrl.clone();
    destination.pathname = role ? roleLanding[role] : "/login";
    destination.search = "";
    if (!role) destination.searchParams.set("next", path);
    return NextResponse.redirect(destination);
  }

  if ((path === "/login" || path === "/register") && role) {
    const destination = request.nextUrl.clone();
    destination.pathname = roleLanding[role];
    destination.search = "";
    return NextResponse.redirect(destination);
  }

  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/teacher/:path*", "/student/:path*", "/login", "/register"] };
