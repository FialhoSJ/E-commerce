import Link from 'next/link';

const craft = [
  { n: '01', title: 'Design com propósito', text: 'Objetos pensados para o cotidiano, com forma, função e personalidade.' },
  { n: '02', title: 'Produção consciente', text: 'Cada peça ganha vida sob demanda, camada por camada, sem excesso.' },
  { n: '03', title: 'Feito para você', text: 'Cores, medidas e ideias especiais também cabem no nosso ateliê.' },
];

export default function Home() {
  return <div className="overflow-hidden bg-[#f3f0e8] text-[#242622]">
    <section className="mx-auto grid max-w-[1440px] items-center gap-12 px-6 pb-16 pt-12 sm:px-10 lg:min-h-[680px] lg:grid-cols-[1fr_.9fr] lg:px-16 lg:py-16">
      <div className="relative z-10">
        <p className="mb-7 inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[.24em] text-[#777568]"><span className="h-px w-9 bg-[#ef6b3b]" /> Estúdio de impressão 3D · Brasil</p>
        <h1 className="max-w-[760px] font-serif text-[clamp(3.7rem,8vw,7.5rem)] leading-[.88] tracking-[-.065em]">Feito em<br /><span className="italic text-[#ef6b3b]">camadas.</span><br />Pensado pra vida.</h1>
        <p className="mt-8 max-w-lg text-base leading-7 text-[#66675d] sm:text-lg">Objetos com textura, forma e função. Criamos e imprimimos peças em 3D para deixar o dia a dia mais interessante.</p>
        <div className="mt-9 flex flex-wrap items-center gap-4">
          <Link href="/loja" className="group inline-flex items-center gap-8 rounded-full bg-[#242622] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#ef6b3b]">Explorar a loja <span className="text-lg transition group-hover:translate-x-1">↗</span></Link>
          <a href="#estudio" className="px-3 py-3 text-sm font-bold text-[#55564f] underline decoration-[#b7b1a4] underline-offset-4 hover:text-[#ef6b3b]">Conheça o estúdio</a>
        </div>
        <div className="mt-14 grid max-w-lg grid-cols-3 border-t border-[#d9d2c5] pt-5">
          <div><strong className="font-serif text-2xl">FDM</strong><p className="mt-1 text-xs text-[#777568]">Impressão precisa</p></div>
          <div className="border-l border-[#d9d2c5] pl-5"><strong className="font-serif text-2xl">Sob</strong><p className="mt-1 text-xs text-[#777568]">demanda</p></div>
          <div className="border-l border-[#d9d2c5] pl-5"><strong className="font-serif text-2xl">BR</strong><p className="mt-1 text-xs text-[#777568]">Enviamos ao Brasil</p></div>
        </div>
      </div>

      <div className="relative mx-auto flex aspect-[.92] w-full max-w-[600px] items-center justify-center overflow-hidden rounded-[2rem] bg-[#30332f] text-white shadow-[0_30px_80px_-35px_rgba(33,35,30,.5)] sm:rounded-[2.5rem]">
        <div className="studio-grid absolute inset-0 opacity-80" />
        <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-[#ef6b3b]/25 blur-3xl" />
        <div className="absolute bottom-[-15%] left-[-12%] h-72 w-72 rounded-full bg-[#a4a27b]/20 blur-3xl" />
        <div className="hero-object"><div className="hero-sculpture" /></div>
        <div className="absolute left-7 top-7 z-10 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-white/70 sm:left-10 sm:top-10"><span className="h-2 w-2 rounded-full bg-[#ef6b3b]" /> Peça em produção</div>
        <div className="absolute bottom-7 left-7 right-7 z-10 flex items-end justify-between sm:bottom-10 sm:left-10 sm:right-10">
          <div><p className="text-[10px] uppercase tracking-[.22em] text-white/55">Estudo nº 024</p><p className="mt-2 font-serif text-2xl sm:text-3xl">Forma em movimento</p></div>
          <span className="grid h-11 w-11 place-items-center rounded-full border border-white/30 text-lg">↗</span>
        </div>
        <span className="absolute right-8 top-1/2 z-10 hidden -rotate-90 text-[9px] tracking-[.3em] text-white/45 sm:block">PLA · CAMADA 0.2 MM · 38 MIN</span>
      </div>
    </section>

    <div className="overflow-hidden border-y border-[#242622] bg-[#ef6b3b] py-4 text-[#242622]">
      <div className="flex min-w-max animate-[ticker_28s_linear_infinite] items-center gap-8 px-5 font-serif text-xl italic sm:text-2xl">Design autoral <span>✳</span> Impressão 3D <span>✳</span> Objetos para morar <span>✳</span> Feito em camadas <span>✳</span> Design autoral <span>✳</span> Impressão 3D <span>✳</span> Objetos para morar <span>✳</span> Feito em camadas <span>✳</span></div>
    </div>

    <section id="estudio" className="mx-auto grid max-w-[1440px] gap-12 px-6 py-20 sm:px-10 lg:grid-cols-[.8fr_1.2fr] lg:px-16 lg:py-28">
      <div><p className="text-[11px] font-bold uppercase tracking-[.24em] text-[#ef6b3b]">Nosso jeito de fazer</p><h2 className="mt-5 max-w-md font-serif text-4xl leading-[1.02] tracking-[-.04em] sm:text-5xl">Uma ideia de cada vez. Uma camada de cada vez.</h2><p className="mt-6 max-w-md leading-7 text-[#66675d]">LACIS é um estúdio independente que explora a impressão 3D como ferramenta de design. Experimentamos formas e materiais para criar objetos que merecem ficar à vista.</p><Link href="/loja" className="mt-7 inline-flex items-center gap-3 text-sm font-bold text-[#242622] hover:text-[#ef6b3b]">Feito aqui, para sua casa <span>↗</span></Link></div>
      <div className="grid gap-4 sm:grid-cols-3">{craft.map((item) => <article key={item.n} className="relative flex min-h-52 flex-col justify-between border-t border-[#bcb5a8] py-5 sm:min-h-64"><span className="font-serif text-4xl italic text-[#ef6b3b]">{item.n}</span><div><h3 className="font-serif text-xl">{item.title}</h3><p className="mt-3 text-sm leading-6 text-[#777568]">{item.text}</p></div></article>)}</div>
    </section>

    <section className="bg-[#e8e1d4] px-6 py-20 sm:px-10 lg:px-16 lg:py-24">
      <div className="mx-auto max-w-[1312px]">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="text-[11px] font-bold uppercase tracking-[.24em] text-[#ef6b3b]">Escolha seu próximo favorito</p><h2 className="mt-4 font-serif text-4xl tracking-[-.04em] sm:text-5xl">Pequenas formas,<br className="hidden sm:block" /> grandes presenças.</h2></div><Link href="/loja" className="group inline-flex items-center gap-3 self-start rounded-full border border-[#242622]/30 px-5 py-3 text-sm font-bold transition hover:bg-[#242622] hover:text-white sm:self-auto">Ver todos os objetos <span className="transition group-hover:translate-x-1">↗</span></Link></div>
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          <Link href="/loja" className="group relative flex min-h-[300px] flex-col justify-between overflow-hidden rounded-2xl bg-[#9b9a79] p-7 text-white sm:min-h-[390px]"><span className="relative z-10 text-[10px] font-bold uppercase tracking-[.2em]">01 / Casa</span><div className="absolute right-8 top-16 h-44 w-36 rotate-[-12deg] rounded-[45%_45%_12%_12%] border-[14px] border-[#d1c4a7] bg-[#e1d4b9] shadow-[18px_20px_0_#747452] transition duration-500 group-hover:rotate-[-5deg] group-hover:scale-105"><div className="absolute inset-x-4 top-5 h-4 rounded-full border border-[#a89b80]" /></div><div className="relative z-10"><h3 className="font-serif text-3xl">Design & decoração</h3><p className="mt-2 text-sm text-white/75">Peças que mudam o ambiente.</p></div><span className="absolute bottom-7 right-7 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/50 transition group-hover:bg-white group-hover:text-[#242622]">↗</span></Link>
          <Link href="/loja" className="group relative flex min-h-[300px] flex-col justify-between overflow-hidden rounded-2xl bg-[#b86947] p-7 text-white sm:min-h-[390px]"><span className="relative z-10 text-[10px] font-bold uppercase tracking-[.2em]">02 / Rotina</span><div className="absolute right-10 top-16 h-40 w-40 rounded-[38%] border-[15px] border-[#e89a70] bg-[#dc8059] shadow-[16px_18px_0_#944a38] transition duration-500 group-hover:rotate-12 group-hover:scale-105"><div className="absolute inset-7 rounded-[35%] border border-[#ffbd91]" /></div><div className="relative z-10"><h3 className="font-serif text-3xl">Acessórios úteis</h3><p className="mt-2 text-sm text-white/75">Detalhes que facilitam o dia.</p></div><span className="absolute bottom-7 right-7 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/50 transition group-hover:bg-white group-hover:text-[#242622]">↗</span></Link>
          <Link href="/loja" className="group relative flex min-h-[300px] flex-col justify-between overflow-hidden rounded-2xl bg-[#353a35] p-7 text-white sm:min-h-[390px]"><span className="relative z-10 text-[10px] font-bold uppercase tracking-[.2em]">03 / Sob medida</span><div className="absolute right-10 top-16 h-40 w-40 rotate-45 border-[14px] border-[#d6a579] bg-[#ef6b3b] shadow-[16px_18px_0_#964b32] transition duration-500 group-hover:rotate-[58deg] group-hover:scale-105"><div className="absolute inset-5 border border-[#ffd0a4]" /></div><div className="relative z-10"><h3 className="font-serif text-3xl">Ideias personalizadas</h3><p className="mt-2 text-sm text-white/65">Sua ideia também pode ganhar forma.</p></div><span className="absolute bottom-7 right-7 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/50 transition group-hover:bg-white group-hover:text-[#242622]">↗</span></Link>
        </div>
      </div>
    </section>

    <section className="mx-auto grid max-w-[1440px] gap-12 px-6 py-20 sm:px-10 lg:grid-cols-[.7fr_1.3fr] lg:px-16 lg:py-28">
      <div><p className="text-[11px] font-bold uppercase tracking-[.24em] text-[#ef6b3b]">Do nosso ateliê</p><h2 className="mt-4 font-serif text-4xl tracking-[-.04em] sm:text-5xl">Do arquivo ao objeto.</h2><p className="mt-5 max-w-sm leading-7 text-[#66675d]">Prototipagem, reposição ou aquele projeto que ainda não existe pronto. A gente conversa, desenha e produz.</p><Link href="/loja" className="mt-7 inline-flex rounded-full bg-[#ef6b3b] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#c94924]">Começar um projeto ↗</Link></div>
      <div className="grid grid-cols-2 gap-3 sm:gap-5"><div className="flex min-h-52 flex-col justify-between rounded-2xl bg-[#dad3c6] p-5 sm:min-h-64 sm:p-7"><span className="font-serif text-5xl text-[#ef6b3b]">01</span><div><h3 className="font-serif text-xl">Você imagina</h3><p className="mt-2 text-sm leading-6 text-[#777568]">Traz sua ideia, referência ou arquivo 3D.</p></div></div><div className="mt-8 flex min-h-52 flex-col justify-between rounded-2xl bg-[#242622] p-5 text-white sm:mt-12 sm:min-h-64 sm:p-7"><span className="font-serif text-5xl text-[#ef6b3b]">02</span><div><h3 className="font-serif text-xl">A gente cria</h3><p className="mt-2 text-sm leading-6 text-white/60">Ajustamos o desenho e escolhemos o material.</p></div></div><div className="-mt-8 flex min-h-52 flex-col justify-between rounded-2xl bg-[#ef6b3b] p-5 sm:-mt-12 sm:min-h-64 sm:p-7"><span className="font-serif text-5xl">03</span><div><h3 className="font-serif text-xl">Imprimimos</h3><p className="mt-2 text-sm leading-6 text-[#512b20]/75">Camada por camada, com atenção ao detalhe.</p></div></div><div className="flex min-h-52 flex-col justify-between rounded-2xl bg-[#d5d5bc] p-5 sm:min-h-64 sm:p-7"><span className="font-serif text-5xl text-[#6b7046]">04</span><div><h3 className="font-serif text-xl">Chega até você</h3><p className="mt-2 text-sm leading-6 text-[#777568]">Peça pronta, embalada e enviada com cuidado.</p></div></div></div>
    </section>

    <section className="bg-[#242622] px-6 py-16 text-white sm:px-10 lg:px-16 lg:py-20"><div className="mx-auto flex max-w-[1312px] flex-col justify-between gap-8 sm:flex-row sm:items-center"><div><p className="text-[11px] font-bold uppercase tracking-[.24em] text-[#ef6b3b]">Feito para durar e despertar curiosidade</p><h2 className="mt-4 max-w-2xl font-serif text-4xl leading-tight tracking-[-.04em] sm:text-5xl">Não é só impressão. É a próxima peça da sua história.</h2></div><Link href="/loja" className="inline-flex shrink-0 items-center justify-center gap-6 rounded-full bg-[#ef6b3b] px-7 py-4 text-sm font-bold transition hover:bg-white hover:text-[#242622]">Encontrar meu objeto <span>↗</span></Link></div></section>

    <footer className="bg-[#e8e1d4] px-6 py-10 sm:px-10 lg:px-16"><div className="mx-auto flex max-w-[1312px] flex-col gap-8 border-t border-[#c8c0b2] pt-8 sm:flex-row sm:items-end sm:justify-between"><div><Link href="/" className="font-black tracking-[.18em]">LACIS<span className="text-[#ef6b3b]">.</span></Link><p className="mt-2 text-sm text-[#777568]">Objetos feitos em camadas, em São Paulo.</p></div><div className="flex gap-6 text-sm font-semibold"><Link href="/loja" className="hover:text-[#ef6b3b]">Loja</Link><Link href="/#estudio" className="hover:text-[#ef6b3b]">Estúdio</Link><Link href="/auth" className="hover:text-[#ef6b3b]">Minha conta</Link></div><span className="text-xs text-[#777568]">© 2026 LACIS Studio</span></div></footer>
  </div>;
}
