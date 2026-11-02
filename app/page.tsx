export default function HomePage() {
  return (
    <main className="min-h-screen px-5 py-8 sm:px-10 lg:px-16">
      <nav className="mx-auto flex max-w-6xl items-center justify-between">
        <a className="flex items-center gap-3 font-bold tracking-tight" href="/">
          <span className="grid size-10 place-items-center rounded-2xl bg-arena-600 text-xl text-white">B</span>
          <span className="text-lg">BilimArena</span>
        </a>
        <span className="rounded-full border border-arena-100 bg-white px-4 py-2 text-sm font-semibold text-arena-600">Beta tayyorlanmoqda</span>
      </nav>
      <section className="mx-auto grid max-w-6xl items-center gap-12 py-20 lg:grid-cols-[1.1fr_.9fr] lg:py-28">
        <div>
          <p className="mb-5 inline-flex rounded-full bg-arena-100 px-3 py-1.5 text-xs font-bold uppercase tracking-[.16em] text-arena-600">Bilimni sinashning yangi usuli</p>
          <h1 className="max-w-2xl text-5xl font-black leading-[1.04] tracking-[-.045em] sm:text-7xl">Bilimingni <span className="text-arena-600">bellashuvda</span> ko‘rsat.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">Ustoz test yaratadi, o‘quvchilar esa jonli bellashuvda bilim va tezlikni sinaydi. Har bir to‘g‘ri javob — yangi XP.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a className="rounded-xl bg-arena-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-arena-600/20 transition hover:bg-arena-500" href="/register">Boshlash <span aria-hidden="true">→</span></a>
            <a className="rounded-xl border border-slate-200 bg-white px-6 py-3.5 font-bold text-slate-700 transition hover:border-arena-200" href="/join">Bellashuvga qo‘shilish</a>
          </div>
          <div className="mt-12 flex items-center gap-4 text-sm text-slate-500"><span className="flex -space-x-2"><i className="size-8 rounded-full border-2 border-[#f5f6fb] bg-amber-300"/><i className="size-8 rounded-full border-2 border-[#f5f6fb] bg-emerald-300"/><i className="size-8 rounded-full border-2 border-[#f5f6fb] bg-indigo-300"/></span>Birgalikda o‘rganing. O‘sishni kuzating.</div>
        </div>
        <div className="relative mx-auto w-full max-w-lg">
          <div className="absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-indigo-200/60 via-sky-100/50 to-amber-100/60 blur-2xl" />
          <div className="relative rounded-[2rem] border border-white bg-white p-5 shadow-2xl shadow-indigo-950/10 sm:p-7">
            <div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-widest text-slate-400">Jonli bellashuv</span><span className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"><i className="size-2 rounded-full bg-emerald-500"/> 24 o‘yinchi</span></div>
            <div className="mt-7 rounded-2xl bg-arena-900 p-6 text-white"><p className="text-sm text-indigo-200">Savol 04 <span className="float-right">00:18</span></p><h2 className="mt-4 text-xl font-bold leading-snug">Quyosh sistemasidagi eng katta sayyora qaysi?</h2><div className="mt-5 grid grid-cols-2 gap-3">{[["A", "Mars", "bg-rose-500"], ["B", "Yupiter", "bg-emerald-500"], ["C", "Venera", "bg-amber-500"], ["D", "Saturn", "bg-sky-500"]].map(([letter, answer, color]) => <div key={letter} className={`${color} flex items-center gap-3 rounded-xl px-3 py-3 font-semibold`}><span className="grid size-7 place-items-center rounded-lg bg-white/20 text-xs">{letter}</span>{answer}</div>)}</div></div>
            <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"><span className="text-sm font-semibold text-slate-600">🏆 1-o‘rin: Dilshod</span><span className="text-sm font-black text-arena-600">+120 XP</span></div>
          </div>
          <div className="absolute -right-4 -top-5 rotate-6 rounded-2xl bg-amber-300 px-4 py-3 text-sm font-black text-amber-950 shadow-lg">+10 XP ✨</div>
        </div>
      </section>
    </main>
  );
}
