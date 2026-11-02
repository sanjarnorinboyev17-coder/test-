import Link from "next/link";
import { AuthForm } from "@/app/(auth)/auth-form";

export default function LoginPage() {
  return <main className="grid min-h-screen place-items-center px-5 py-10"><section className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-10">
    <Link href="/" className="text-sm font-bold text-arena-600">← BilimArena bosh sahifa</Link>
    <h1 className="mt-8 text-3xl font-black tracking-tight">Xush kelibsiz</h1><p className="mt-2 text-slate-500">Hisobingizga kirib bellashuvni davom ettiring.</p>
    <AuthForm mode="login" />
    <p className="mt-6 text-center text-sm text-slate-500">Hisobingiz yo‘qmi? <Link className="font-bold text-arena-600" href="/register">Ro‘yxatdan o‘ting</Link></p>
  </section></main>;
}
