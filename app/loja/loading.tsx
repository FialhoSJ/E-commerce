export default function LojaLoading() {
  return (
    <div className="bg-[#f8faf9] text-slate-950 min-h-screen">
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-12 lg:px-10">
        <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200" />

        <div className="mt-8 flex flex-col justify-between gap-6 border-b border-slate-200 pb-8 sm:flex-row sm:items-end">
          <div className="flex-1">
            <div className="h-3 w-24 animate-pulse rounded-full bg-slate-200" />
            <div className="mt-4 h-10 w-72 animate-pulse rounded-2xl bg-slate-200" />
            <div className="mt-3 h-4 w-full max-w-lg animate-pulse rounded-full bg-slate-200" />
          </div>
          <div className="h-10 w-44 animate-pulse rounded-full bg-slate-200" />
        </div>

        <div className="mt-8 flex flex-col gap-4 rounded-3xl bg-white p-6 border border-slate-200/80 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="h-12 flex-1 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-12 w-48 animate-pulse rounded-2xl bg-slate-100" />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-32 animate-pulse rounded-full bg-slate-200" />
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="aspect-square animate-pulse rounded-2xl bg-slate-100" />
              <div className="mt-4 h-3 w-20 animate-pulse rounded-full bg-slate-200" />
              <div className="mt-2 h-5 w-full animate-pulse rounded-full bg-slate-200" />
              <div className="mt-2 h-5 w-2/3 animate-pulse rounded-full bg-slate-200" />
              <div className="mt-4 h-6 w-24 animate-pulse rounded-full bg-slate-200" />
              <div className="mt-4 h-10 w-full animate-pulse rounded-xl bg-slate-100" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
