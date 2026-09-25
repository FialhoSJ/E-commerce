'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ProductType } from '@/lib/types/ProductType';
import Product from '../components/Product';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } } };

interface ShopClientProps {
  initialProducts: ProductType[];
}

export default function ShopClient({ initialProducts }: ShopClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const catalogProducts = initialProducts;


  // Extrair categorias únicas
  const categories = useMemo(() => {
    const cats = new Set(catalogProducts.map((p) => p.category));
    return ['all', ...Array.from(cats)];
  }, [catalogProducts]);

  // Filtrar e ordenar produtos
  const filteredProducts = useMemo(() => {
    let result = [...catalogProducts];

    // Busca por texto
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query))
      );
    }

    // Filtro por categoria
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Ordenação
    if (sortBy === 'price-asc') {
      result.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [catalogProducts, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-[#f3f0e8] text-[#242622]">
      <section className="mx-auto max-w-[1440px] px-6 pb-24 pt-10 sm:px-10 lg:px-16">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-[#777568] transition hover:text-[#ef6b3b]">
          ← Voltar para a apresentação
        </Link>

        <div className="relative mt-7 flex flex-col justify-between gap-8 overflow-hidden rounded-[2rem] bg-[#30332f] px-7 py-10 text-white sm:flex-row sm:items-end sm:px-10 sm:py-12">
          <div className="studio-grid absolute inset-0 opacity-70" />
          <div className="absolute -right-10 -top-28 h-72 w-72 rounded-full border border-white/15 sm:right-20 sm:top-[-13rem] sm:h-[28rem] sm:w-[28rem]" />
          <div>
            <p className="relative text-[10px] font-bold uppercase tracking-[.24em] text-[#f18a5e]">LACIS / Objetos impressos em 3D</p>
            <h1 className="relative mt-4 font-serif text-4xl tracking-[-.04em] sm:text-6xl">Objetos com outra<br className="hidden sm:block" /> camada de personalidade.</h1>
            <p className="relative mt-4 max-w-lg text-sm leading-6 text-white/65 sm:text-base">Peças para casa, mesa e rotina. Produzidas em pequenos lotes e com cuidado em cada detalhe.</p>
          </div>
          <div className="relative inline-flex items-center gap-2 self-start rounded-full border border-white/25 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white sm:self-auto">
            <span className="h-2 w-2 rounded-full bg-[#ef6b3b]" /> {filteredProducts.length} objetos disponíveis
          </div>
        </div>

        {/* Barra de Filtros e Busca */}
        <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-[#d9d2c5] bg-[#f8f6f0] p-4 md:flex-row md:items-center md:justify-between">
          {/* Input de Busca */}
          <div className="relative flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#999486]">⌕</span>
            <input
              type="text"
              placeholder="Buscar produtos por nome ou descrição..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[#e2ddd3] bg-[#f3f0e8] py-3.5 pl-11 pr-4 text-sm text-[#242622] placeholder:text-[#999486] transition focus:border-[#ef6b3b] focus:bg-white focus:outline-none"
            />
          </div>

          {/* Ordenação */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold uppercase tracking-[.12em] text-[#777568] whitespace-nowrap">Ordenar</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-[#e2ddd3] bg-[#f3f0e8] px-4 py-3.5 text-sm font-semibold text-[#242622] transition focus:border-[#ef6b3b] focus:bg-white focus:outline-none"
            >
              <option value="featured">Destaques</option>
              <option value="price-asc">Menor Preço</option>
              <option value="price-desc">Maior Preço</option>
              <option value="title">Nome (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Abas de Categorias */}
        <div className="mt-7 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-5 py-2.5 text-xs font-semibold capitalize transition ${
                selectedCategory === cat
                  ? 'bg-[#ef6b3b] text-white shadow-md shadow-orange-950/10'
                  : 'border border-[#d9d2c5] bg-[#f8f6f0] text-[#66675d] hover:border-[#ef6b3b] hover:text-[#242622]'
              }`}
            >
              {cat === 'all' ? 'Todas as categorias' : cat}
            </button>
          ))}
        </div>

        {/* Vitrine de Produtos ou Estado Vazio */}
        {filteredProducts.length > 0 ? (
          <motion.div
            className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {filteredProducts.map((product) => (
              <motion.div key={product.id} variants={item}>
                <Product product={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="mt-16 flex flex-col items-center justify-center rounded-3xl bg-white p-16 border border-slate-200 text-center shadow-sm">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-slate-900">Nenhum produto encontrado</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-sm">Tente buscar por outro termo ou selecione outra categoria para ver mais opções.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSortBy('featured');
              }}
              className="mt-6 rounded-full bg-slate-950 px-6 py-3 text-xs font-semibold text-white transition hover:bg-teal-700"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
