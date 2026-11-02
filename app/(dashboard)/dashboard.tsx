import Link from "next/link";
import { redirect } from "next/navigation";
import { clearSession, currentUser } from "@/lib/auth";
import { TestLibrary } from "@/app/teacher/test-library";

export async function Dashboard({ role }: { role: "ADMIN" | "TEACHER" | "STUDENT" }) {
  const user = await currentUser();
  if (!user || user.role !== role) redirect("/login");
  async function logout() {
    "use server";
    await clearSession();
    redirect("/login");
  }
  return <main className="min-h-screen px-5 py-8 sm:px-10"><div className="mx-auto max-w-5xl">
    <header className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-5 py-4"><Link href="/" className="font-black text-arena-600">BilimArena</Link><form action={logout}><button className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Chiqish</button></form></header>
    <section className="mt-8 rounded-3xl bg-arena-900 p-8 text-white sm:p-12"><p className="text-sm font-bold uppercase tracking-widest text-indigo-200">{role === "ADMIN" ? "Administrator" : role === "TEACHER" ? "Ustoz kabineti" : "O‘quvchi kabineti"}</p><h1 className="mt-3 text-3xl font-black sm:text-4xl">Xush kelibsiz, {user.username}!</h1><p className="mt-3 max-w-xl leading-7 text-indigo-100">{role === "TEACHER" ? "Testlaringizni yarating, savollar va javob variantlarini kiriting." : "BilimArena akkauntingiz tayyor. Testlar, bellashuvlar va reyting imkoniyatlari shu yerda paydo bo‘ladi."}</p><div className="mt-7 inline-flex rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold">{user.title?.name ?? "Yangi"} <span className="mx-2 text-indigo-300">·</span>{user.xp} XP</div></section>
    {role === "TEACHER" && <TestLibrary />}
  </div></main>;
}
