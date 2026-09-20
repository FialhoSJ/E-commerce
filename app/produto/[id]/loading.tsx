export default function ProdutoLoading() {
  return (
    <div className="bg-[#f8faf9] text-slate-950 min-h-screen">
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-12 lg:px-10">
        <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200" />

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Skeleton da imagem */}
          <div className="aspect-square animate-pulse rounded-3xl bg-slate-200" />

          {/* Skeleton das informações */}
          <div className="flex flex-col">
            <div className="h-3 w-28 animate-pulse rounded-full bg-slate-200" />
            <div className="mt-4 h-10 w-3/4 animate-pulse rounded-2xl bg-slate-200" />
            <div className="mt-3 h-8 w-32 animate-pulse rounded-full bg-slate-200" />

            <div className="mt-6 space-y-3">
              <div className="h-4 w-full animate-pulse rounded-full bg-slate-200" />
              <div className="h-4 w-5/6 animate-pulse rounded-full bg-slate-200" />
              <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-200" />
            </div>

            <div className="mt-8 flex gap-3">
              <div className="h-12 w-32 animate-pulse rounded-2xl bg-slate-200" />
              <div className="h-12 w-32 animate-pulse rounded-2xl bg-slate-200" />
            </div>

            <div className="mt-8 h-14 w-full animate-pulse rounded-2xl bg-slate-950/10" />
          </div>
        </div>
      </section>
    </div>
  );
}
