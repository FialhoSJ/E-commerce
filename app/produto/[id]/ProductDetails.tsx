'use client';

import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { ProductType } from '@/lib/types/ProductType';
import { useStore } from '../../components/StoreProvider';

export default function ProductDetails({ product }: { product: ProductType }) {
  const { addToCart } = useStore();
  const [added, setAdded] = useState(false);
  const buy = () => { addToCart(product); toast.success(`${product.title} adicionado ao carrinho!`); setAdded(true); window.setTimeout(() => setAdded(false), 1800); };
  return <main className="mx-auto max-w-6xl px-6 py-14 lg:px-10"><Link href="/loja" className="text-sm font-semibold text-teal-700">← Voltar para a loja</Link><div className="mt-10 grid gap-12 rounded-[2rem] bg-white p-6 shadow-sm sm:p-10 lg:grid-cols-2"><div className="flex min-h-[420px] items-center justify-center rounded-3xl bg-slate-50 p-10"><Image src={product.image} alt={product.title} width={480} height={480} className="max-h-[390px] w-full object-contain" priority /></div><div className="flex flex-col justify-center"><p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-700">{product.category}</p><h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight">{product.title}</h1><p className="mt-5 text-3xl font-semibold text-slate-950">{product.price?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p><p className="mt-6 leading-7 text-slate-600">{product.description}</p><button onClick={buy} className={`mt-8 flex items-center justify-center gap-2 rounded-full px-6 py-4 font-semibold text-white transition ${added ? 'scale-[1.02] bg-emerald-600' : 'bg-slate-950 hover:bg-teal-700'}`}><span>{added ? '✓ Adicionado ao carrinho' : 'Adicionar ao carrinho'}</span></button>{added && <Link href="/loja" className="mt-3 text-center text-sm font-semibold text-teal-700">Continuar comprando</Link>}</div></div></main>;
}
