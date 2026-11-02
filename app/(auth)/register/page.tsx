import Link from "next/link";
import { AuthForm } from "@/app/(auth)/auth-form";

export default function RegisterPage() {
  return <main className="grid min-h-screen place-items-center px-5 py-10"><section className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-10">
    <Link href="/" className="text-sm font-bold text-arena-600">← BilimArena bosh sahifa</Link>
    <h1 className="mt-8 text-3xl font-black tracking-tight">Hisob yarating</h1><p className="mt-2 text-slate-500">O‘quvchi yoki ustoz sifatida qo‘shiling.</p>
    <AuthForm mode="register" />
    <p className="mt-6 text-center text-sm text-slate-500">Hisobingiz bormi? <Link className="font-bold text-arena-600" href="/login">Kirish</Link></p>
  </section></main>;
}
