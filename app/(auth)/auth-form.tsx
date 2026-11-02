"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "login" | "register";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const response = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "So‘rov bajarilmadi.");
      router.replace(result.redirectTo);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Tarmoq xatosi. Qayta urinib ko‘ring.");
    } finally {
      setBusy(false);
    }
  }

  const registering = mode === "register";
  return <form onSubmit={submit} className="mt-8 space-y-5">
    {registering && <label className="block text-sm font-semibold text-slate-700">Hisob turi
      <select name="role" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-arena-500 focus:ring-4 focus:ring-arena-100">
        <option value="STUDENT">O‘quvchi</option><option value="TEACHER">Ustoz</option>
      </select>
    </label>}
    <label className="block text-sm font-semibold text-slate-700">Login
      <input name="username" autoComplete="username" required minLength={registering ? 3 : 1} maxLength={32} pattern={registering ? "[A-Za-z0-9_]+" : undefined} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none placeholder:font-normal placeholder:text-slate-400 focus:border-arena-500 focus:ring-4 focus:ring-arena-100" placeholder="Masalan: ali_2008" />
    </label>
    <label className="block text-sm font-semibold text-slate-700">Parol
      <input name="password" type="password" autoComplete={registering ? "new-password" : "current-password"} required minLength={registering ? 12 : 1} maxLength={128} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none placeholder:font-normal placeholder:text-slate-400 focus:border-arena-500 focus:ring-4 focus:ring-arena-100" placeholder={registering ? "Kamida 12 belgi" : "Parolingiz"} />
    </label>
    {error && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}
    <button disabled={busy} className="flex w-full items-center justify-center rounded-xl bg-arena-600 px-5 py-3.5 font-bold text-white transition hover:bg-arena-500 disabled:cursor-wait disabled:opacity-60">{busy ? "Tekshirilmoqda…" : registering ? "Hisob yaratish" : "Kirish"}</button>
  </form>;
}
