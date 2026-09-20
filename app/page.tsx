import Link from 'next/link';

const highlights = [
  { number: '01', title: 'Precisão em cada camada', text: 'Impressão com tolerância de até 0,1 mm para peças que encaixam perfeitamente.' },
  { number: '02', title: 'Materiais que duram', text: 'PLA, PETG, ABS, TPU e resina selecionados para resistência e acabamento impecável.' },
  { number: '03', title: 'Do arquivo ao objeto', text: 'Envie seu modelo 3D ou escolha na loja: imprimimos e entregamos onde estiver.' },
];

export default function Home() {
  return <div className="bg-[#f8faf9] text-slate-950">
    <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-24 pt-20 lg:grid-cols-[1.05fr_.95fr] lg:px-10 lg:pt-28">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-teal-100/70 px-3.5 py-1 text-xs font-semibold text-teal-800 mb-6">
          <span className="h-2 w-2 rounded-full bg-teal-600 animate-pulse" /> Impressão 3D sob medida
        </div>
        <p className="mb-4 text-sm font-bold uppercase tracking-[0.22em] text-teal-700">Impressão 3D e produtos personalizados</p>
        <h1 className="max-w-3xl text-5xl font-semibold leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl">Suas ideias viram objetos reais.</h1>
        <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">Imprimimos peças decorativas, funcionais e protótipos em 3D com precisão milimétrica, acabamento profissional e entrega para todo o Brasil.</p>
        <div className="mt-9 flex flex-wrap gap-4">
          <Link href="/loja" className="rounded-full bg-slate-950 px-7 py-4 font-semibold text-white transition hover:bg-teal-700 shadow-lg shadow-slate-950/10">Conheça a loja <span className="ml-2">↗</span></Link>
          <a href="#sobre" className="rounded-full border border-slate-300 bg-white px-7 py-4 font-semibold text-slate-700 transition hover:border-slate-950 hover:bg-slate-50">Sobre a empresa</a>
        </div>
        <div className="mt-12 flex items-center gap-8 border-t border-slate-200/80 pt-8">
          <div><p className="text-2xl font-bold text-slate-950">+1.500</p><p className="text-sm text-slate-500">Peças impressas</p></div>
          <div className="h-8 w-px bg-slate-200" />
          <div><p className="text-2xl font-bold text-slate-950">6</p><p className="text-sm text-slate-500">Tipos de material</p></div>
          <div className="h-8 w-px bg-slate-200" />
          <div><p className="text-2xl font-bold text-slate-950">0,1mm</p><p className="text-sm text-slate-500">De precisão</p></div>
        </div>
      </div>
      <div className="relative min-h-[420px] overflow-hidden rounded-[2.55rem] bg-slate-900 p-8 text-white shadow-2xl sm:min-h-[520px]">
        <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-teal-500/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-12 h-64 w-64 rounded-full bg-amber-200/20 blur-3xl" />
        <div className="relative flex h-full flex-col justify-between">
          <div className="flex items-center justify-between"><span className="text-sm font-medium text-white/70 tracking-widest">FAB. 3D</span><span className="rounded-full bg-white/10 px-3 py-1 text-xs text-teal-300 font-medium">Sob demanda</span></div>
          <div><p className="max-w-xs text-4xl font-medium leading-tight">Do digital<br /><span className="text-teal-300">ao físico.</span></p><div className="mt-8 flex items-center gap-3 text-sm text-white/70"><span className="h-px w-12 bg-teal-400" />Camada por camada, com precisão total.</div></div>
        </div>
      </div>
    </section>

    <section id="sobre" className="border-y border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-[.8fr_1.2fr] lg:px-10">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-teal-700">O nosso jeito</p>
          <h2 className="mt-4 max-w-md text-3xl font-semibold tracking-tight sm:text-4xl">A qualidade está em cada camada.</h2>
          <p className="mt-4 text-slate-600 leading-relaxed">Unimos tecnologia de impressão 3D FDM e resina com design e engenharia para entregar peças resistentes, funcionais e com acabamento de primeiro nível.</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {highlights.map((item) => <div key={item.number} className="rounded-2xl bg-slate-50 p-6 border border-slate-100 transition hover:border-slate-200 hover:shadow-sm"><span className="text-sm font-bold text-teal-600">{item.number}</span><h3 className="mt-4 font-semibold text-slate-900">{item.title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p></div>)}
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-teal-700">Nossa seleção</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Descubra o catálogo 3D</h2>
        </div>
        <Link href="/loja" className="group inline-flex items-center gap-2 font-semibold text-teal-700 hover:text-teal-900">Ver todos os produtos <span className="transition group-hover:translate-x-1">→</span></Link>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        <Link href="/loja" className="group relative overflow-hidden rounded-3xl bg-[#dceeea] p-8 transition hover:shadow-lg"><p className="text-sm font-medium text-teal-800">Decoração</p><h3 className="mt-20 text-2xl font-semibold text-slate-900">Objetos impressos que impressionam.</h3><div className="mt-8 inline-flex items-center text-sm font-semibold text-teal-900">Explorar categoria <span className="ml-1 transition group-hover:translate-x-1">→</span></div></Link>
        <Link href="/loja" className="group relative overflow-hidden rounded-3xl bg-[#f0e9da] p-8 transition hover:shadow-lg"><p className="text-sm font-medium text-amber-900">Peças funcionais</p><h3 className="mt-20 text-2xl font-semibold text-slate-900">Reposição e utilidade.</h3><div className="mt-8 inline-flex items-center text-sm font-semibold text-amber-950">Explorar categoria <span className="ml-1 transition group-hover:translate-x-1">→</span></div></Link>
        <Link href="/loja" className="group relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white transition hover:shadow-lg"><p className="text-sm font-medium text-teal-300">Prototipagem</p><h3 className="mt-20 text-2xl font-semibold text-white">Do projeto ao produto.</h3><div className="mt-8 inline-flex items-center text-sm font-semibold text-teal-300">Explorar categoria <span className="ml-1 transition group-hover:translate-x-1">→</span></div></Link>
      </div>
    </section>

    {/* Seção de Depoimentos / Avaliações */}
    <section className="border-t border-slate-200 bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-teal-700">Depoimentos</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">O que dizem nossos clientes</h2>
          <p className="mt-4 text-slate-600">Histórias reais de quem transformou ideias em objetos com a 3D Store.</p>
        </div>
        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          <div className="rounded-3xl bg-[#f8faf9] p-8 border border-slate-200/60 relative">
            <div className="flex text-amber-400 mb-4 text-sm">★★★★★</div>
            <p className="text-slate-700 text-sm leading-relaxed">&ldquo;Precisava de um protótipo para apresentar a um cliente e a peça saiu perfeita, com encaixes exatos. Impressionante a qualidade da impressão.&rdquo;</p>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-teal-800 text-white flex items-center justify-center font-bold text-sm">MC</div>
              <div><p className="font-semibold text-sm text-slate-900">Mariana Costa</p><p className="text-xs text-slate-500">Engenheira de Produto</p></div>
            </div>
          </div>
          <div className="rounded-3xl bg-[#f8faf9] p-8 border border-slate-200/60 relative">
            <div className="flex text-amber-400 mb-4 text-sm">★★★★★</div>
            <p className="text-slate-700 text-sm leading-relaxed">&ldquo;Consegui uma peça de reposição que já estava descontinuada pelo fabricante. Imprimiram em PETG e ficou mais resistente que a original.&rdquo;</p>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm">RS</div>
              <div><p className="font-semibold text-sm text-slate-900">Rafael Souza</p><p className="text-xs text-slate-500">Técnico em Mecânica</p></div>
            </div>
          </div>
          <div className="rounded-3xl bg-[#f8faf9] p-8 border border-slate-200/60 relative">
            <div className="flex text-amber-400 mb-4 text-sm">★★★★★</div>
            <p className="text-slate-700 text-sm leading-relaxed">&ldquo;Encomendei um presente personalizado com o nome gravado. O acabamento em resina ficou impecável e a entrega foi rapidíssima.&rdquo;</p>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-sm">CL</div>
              <div><p className="font-semibold text-sm text-slate-900">Camila Lima</p><p className="text-xs text-slate-500">Designer</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Seção FAQ */}
    <section className="bg-slate-50 py-24 border-t border-slate-200">
      <div className="mx-auto max-w-4xl px-6 lg:px-10">
        <div className="text-center mb-16">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-teal-700">Dúvidas Frequentes</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Perguntas comuns</h2>
        </div>
        <div className="grid gap-6">
          <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-900 text-lg">Quais materiais vocês utilizam na impressão 3D?</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">Trabalhamos com PLA, PETG, ABS, TPU e resina. Cada material tem suas vantagens: o PLA é ideal para decoração, o PETG e o ABS para peças funcionais, o TPU para itens flexíveis e a resina para detalhes ultrafinos.</p>
          </div>
          <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-900 text-lg">Como faço um pedido personalizado?</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">Basta enviar seu arquivo 3D nos formatos STL, OBJ ou 3MF pelo nosso atendimento. Analisamos o modelo, calculamos o material e o tempo de impressão, e enviamos uma cotação antes de produzir.</p>
          </div>
          <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-900 text-lg">Qual o prazo de produção e entrega?</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">A produção leva de 3 a 7 dias úteis, dependendo da complexidade e do tamanho da peça. O prazo e o valor do frete são calculados automaticamente no carrinho com base no seu CEP.</p>
          </div>
          <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-900 text-lg">As peças impressas são resistentes?</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">Sim! Escolhemos o material ideal para cada aplicação. Peças em PETG e ABS suportam esforço mecânico e altas temperaturas, e todas as impressões passam por controle de qualidade antes do envio.</p>
          </div>
        </div>
      </div>
    </section>

    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-12 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-10">
        <div>
          <span className="font-bold text-slate-900 text-base">3D Store</span>
          <p className="mt-1 text-slate-400">Impressão 3D, prototipagem e personalização sob medida.</p>
        </div>
        <div className="flex flex-wrap gap-6 font-medium text-slate-600">
          <Link href="/loja" className="hover:text-slate-950">Loja</Link>
          <Link href="/#sobre" className="hover:text-slate-950">Sobre</Link>
          <Link href="/auth" className="hover:text-slate-950">Minha Conta</Link>
        </div>
        <span>© 2026 3D Store. Todos os direitos reservados.</span>
      </div>
    </footer>
  </div>;
}
