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

  // Extrair categorias únicas
  const categories = useMemo(() => {
    const cats = new Set(initialProducts.map((p) => p.category));
    return ['all', ...Array.from(cats)];
  }, [initialProducts]);

  // Filtrar e ordenar produtos
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

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
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [initialProducts, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="bg-[#f8faf9] text-slate-950 min-h-screen">
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-12 lg:px-10">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-teal-700 hover:text-teal-900 transition">
          ← Voltar para a apresentação
        </Link>

        <div className="mt-8 flex flex-col justify-between gap-6 border-b border-slate-200 pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-teal-700">Loja online</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Produtos para fazer parte.</h1>
            <p className="mt-3 max-w-lg text-slate-500">Uma seleção essencial para trazer mais personalidade e design aos seus espaços.</p>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-white px-4 py-2.5 rounded-full border border-slate-200 shadow-sm">
            <span>{filteredProducts.length}</span> produtos encontrados
          </div>
        </div>

        {/* Barra de Filtros e Busca */}
        <div className="mt-8 flex flex-col gap-4 rounded-3xl bg-white p-6 border border-slate-200/80 shadow-sm md:flex-row md:items-center md:justify-between">
          {/* Input de Busca */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="Buscar produtos por nome ou descrição..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-teal-600 focus:bg-white focus:outline-none transition"
            />
          </div>

          {/* Ordenação */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-600 whitespace-nowrap">Ordenar por:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-2xl bg-slate-50 py-3.5 px-4 text-sm font-medium text-slate-900 border border-slate-200 focus:border-teal-600 focus:bg-white focus:outline-none transition"
            >
              <option value="featured">Destaques</option>
              <option value="price-asc">Menor Preço</option>
              <option value="price-desc">Maior Preço</option>
              <option value="title">Nome (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Abas de Categorias */}
        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-5 py-2.5 text-xs font-semibold capitalize transition ${
                selectedCategory === cat
                  ? 'bg-slate-950 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400 hover:text-slate-950'
              }`}
            >
              {cat === 'all' ? '✨ Todas as Categorias' : cat}
            </button>
          ))}
        </div>

        {/* Vitrine de Produtos ou Estado Vazio */}
        {filteredProducts.length > 0 ? (
          <motion.div
            className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
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
