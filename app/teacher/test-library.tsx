"use client";

import { FormEvent, useEffect, useState } from "react";

type TestItem = { id: string; title: string; createdAt: string; _count?: { questions: number } };
type Question = { id: string; text: string; options: string[]; correctIndex: number; xp: number; order: number };

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { "content-type": "application/json", ...init?.headers } });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "So‘rov bajarilmadi.");
  return result;
}

export function TestLibrary() {
  const [tests, setTests] = useState<TestItem[]>([]);
  const [selected, setSelected] = useState<TestItem | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [title, setTitle] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function refreshTests() {
    const data = await api<{ tests: TestItem[] }>("/api/tests");
    setTests(data.tests);
  }
  async function selectTest(test: TestItem) {
    setSelected(test);
    const data = await api<{ test: TestItem & { questions: Question[] } }>(`/api/tests/${test.id}`);
    setQuestions(data.test.questions);
  }
  useEffect(() => { refreshTests().catch((cause) => setError(cause.message)); }, []);

  async function createTest(event: FormEvent) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      const data = await api<{ test: TestItem }>("/api/tests", { method: "POST", body: JSON.stringify({ title }) });
      setTitle(""); await refreshTests(); await selectTest(data.test);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Test yaratilmadi."); }
    finally { setBusy(false); }
  }
  async function addQuestion(event: FormEvent) {
    event.preventDefault(); if (!selected) return;
    setError(""); setBusy(true);
    try {
      await api(`/api/tests/${selected.id}`, { method: "POST", body: JSON.stringify({ text: questionText, options, correctIndex, xp: 10 }) });
      setQuestionText(""); setOptions(["", "", "", ""]); setCorrectIndex(0);
      await selectTest(selected); await refreshTests();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Savol saqlanmadi."); }
    finally { setBusy(false); }
  }
  async function removeQuestion(id: string) {
    if (!selected) return;
    setError("");
    try { await api(`/api/tests/${selected.id}`, { method: "DELETE", body: JSON.stringify({ questionId: id }) }); await selectTest(selected); await refreshTests(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Savol o‘chirilmadi."); }
  }

  return <section className="mt-6 grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-arena-500">Kutubxona</p><h2 className="mt-1 text-xl font-black">Mening testlarim</h2></div><span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-600">{tests.length}</span></div>
      <form onSubmit={createTest} className="mt-5 flex gap-2"><input value={title} onChange={(event) => setTitle(event.target.value)} minLength={2} maxLength={120} required placeholder="Yangi test nomi" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-arena-500"/><button disabled={busy} className="rounded-xl bg-arena-600 px-4 text-sm font-bold text-white disabled:opacity-60">Qo‘shish</button></form>
      <div className="mt-4 space-y-2">{tests.map((test) => <button key={test.id} onClick={() => selectTest(test).catch((cause) => setError(cause.message))} className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${selected?.id === test.id ? "border-arena-300 bg-arena-50" : "border-slate-100 hover:border-slate-200"}`}><span className="font-bold text-slate-800">{test.title}</span><span className="text-xs font-semibold text-slate-500">{test._count?.questions ?? 0} savol</span></button>)}{!tests.length && <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">Hali test yo‘q. Birinchi testingizni yarating.</p>}</div>
    </div>
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
      {selected ? <><p className="text-xs font-bold uppercase tracking-widest text-arena-500">Savollar</p><h2 className="mt-1 text-xl font-black">{selected.title}</h2>
        <form onSubmit={addQuestion} className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4"><label className="block text-sm font-bold text-slate-700">Savol matni<input value={questionText} onChange={(event) => setQuestionText(event.target.value)} required minLength={3} maxLength={1000} placeholder="Savolni yozing" className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:border-arena-500"/></label><div className="grid gap-2 sm:grid-cols-2">{options.map((option, index) => <div key={index} className="flex items-center gap-2"><input type="radio" name="correct" checked={correctIndex === index} onChange={() => setCorrectIndex(index)} aria-label={`${index + 1}-variantni to‘g‘ri deb belgilash`} className="accent-arena-600"/><input value={option} onChange={(event) => setOptions((current) => current.map((value, i) => i === index ? event.target.value : value))} required maxLength={200} placeholder={`${index + 1}-javob varianti`} className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-arena-500"/></div>)}</div><p className="text-xs text-slate-500">To‘g‘ri javobni chapdagi belgidan tanlang.</p><button disabled={busy} className="rounded-lg bg-arena-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">Savolni saqlash</button></form>
        <ol className="mt-4 space-y-3">{questions.map((question, index) => <li key={question.id} className="rounded-xl border border-slate-100 p-4"><div className="flex items-start justify-between gap-3"><p className="font-bold text-slate-800"><span className="mr-2 text-arena-500">{String(index + 1).padStart(2, "0")}</span>{question.text}</p><button onClick={() => removeQuestion(question.id)} aria-label="Savolni o‘chirish" className="shrink-0 rounded-lg px-2 py-1 text-sm font-bold text-rose-600 hover:bg-rose-50">O‘chirish</button></div><div className="mt-3 grid gap-2 sm:grid-cols-2">{question.options.map((option, i) => <span key={i} className={`rounded-lg px-3 py-2 text-sm ${i === question.correctIndex ? "bg-emerald-50 font-semibold text-emerald-700" : "bg-slate-50 text-slate-600"}`}>{option}{i === question.correctIndex ? " · To‘g‘ri" : ""}</span>)}</div></li>)}</ol>
        {!questions.length && <p className="mt-4 rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">Bu testda hali savollar yo‘q.</p>}</> : <div className="grid min-h-72 place-items-center rounded-xl border border-dashed border-slate-200 p-8 text-center"><div><span className="text-3xl">✎</span><h2 className="mt-3 font-black">Testni tanlang</h2><p className="mt-1 text-sm text-slate-500">Yoki yangi test yarating va savollar qo‘shishni boshlang.</p></div></div>}
      {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}
    </div>
  </section>;
}
