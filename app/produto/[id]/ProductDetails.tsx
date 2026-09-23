'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { ProductType } from '@/lib/types/ProductType';
import { useStore } from '../../components/StoreProvider';

export default function ProductDetails({ product }: { product: ProductType }) {
  const router = useRouter();
  const { user, addToCart, reviews, addReview } = useStore();
  const currentProduct = product;
  const [added, setAdded] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');


  const productReviews = reviews[currentProduct.id] || [];
  const averageRating = productReviews.length ? productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length : 0;
  const add = () => { addToCart(currentProduct); toast.success(`${currentProduct.title} adicionado ao carrinho.`); setAdded(true); window.setTimeout(() => setAdded(false), 1800); };
  const buyNow = () => { addToCart(currentProduct); router.push(user ? '/checkout' : '/auth?redirect=/checkout'); };
  const submitReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const error = addReview({ productId: currentProduct.id, rating, comment: comment.trim() });
    if (error) { toast.error(error); return; }
    toast.success('Avaliação publicada.');
    setComment('');
    setRating(5);
  };

  return <main className="mx-auto max-w-6xl px-6 py-14 lg:px-10">
    <Link href="/loja" className="text-sm font-semibold text-teal-700">← Voltar para a loja</Link>
    <div className="mt-10 grid gap-12 rounded-[2rem] bg-white p-6 shadow-sm sm:p-10 lg:grid-cols-2">
      <div className="flex min-h-[420px] items-center justify-center rounded-3xl bg-slate-50 p-10"><Image src={currentProduct.image} alt={currentProduct.title} unoptimized width={480} height={480} className="max-h-[390px] w-full object-contain" priority /></div>
      <div className="flex flex-col justify-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-700">{currentProduct.category}</p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight">{currentProduct.title}</h1>
        <p className="mt-5 text-3xl font-semibold text-slate-950">{currentProduct.price?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
        <p className="mt-6 leading-7 text-slate-600">{currentProduct.description}</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button onClick={add} className={`rounded-full border px-5 py-3 font-semibold transition ${added ? "border-emerald-600 text-emerald-700" : "border-slate-300 text-slate-800 hover:border-teal-600 hover:text-teal-700"}`}>{added ? "✓ Adicionado" : "Adicionar ao carrinho"}</button>
          <button onClick={buyNow} className="rounded-full bg-teal-600 px-5 py-3 font-semibold text-white transition hover:bg-teal-500">Comprar agora</button>
        </div>
        {added && <Link href="/loja" className="mt-3 text-center text-sm font-semibold text-teal-700">Continuar comprando</Link>}
      </div>
    </div>

    <section className="mt-10 rounded-[2rem] bg-white p-6 shadow-sm sm:p-10">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
        <div><p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-700">Experiência de compra</p><h2 className="mt-2 text-2xl font-bold">Comentários e avaliações</h2></div>
        <div className="text-left sm:text-right"><p className="text-2xl font-bold text-amber-500">{averageRating ? averageRating.toFixed(1) : "—"} <span className="text-lg">★</span></p><p className="text-sm text-slate-500">{productReviews.length} avaliação(ões)</p></div>
      </div>
      <div className="mt-6 grid gap-8 lg:grid-cols-[.85fr_1.15fr]">
        <form onSubmit={submitReview} className="rounded-2xl bg-slate-50 p-5">
          <h3 className="font-semibold">Conte o que achou</h3>
          {user ? <>
            <div className="mt-4 flex gap-1" aria-label="Escolha uma nota">{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => setRating(value)} className={`text-2xl ${value <= rating ? "text-amber-400" : "text-slate-300"}`} aria-label={`${value} estrelas`}>★</button>)}</div>
            <textarea required minLength={3} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Escreva um comentário sobre o produto" className="mt-4 min-h-28 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-teal-600" />
            <button className="mt-3 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white hover:bg-teal-700">Publicar avaliação</button>
          </> : <p className="mt-3 text-sm text-slate-500">Entre na sua conta para avaliar este produto.</p>}
        </form>
        <div className="space-y-4">{productReviews.length ? productReviews.map((review) => <article key={review.id} className="border-b border-slate-200 pb-4 last:border-0"><div className="flex items-center justify-between gap-3"><strong>{review.author}</strong><span className="text-sm text-amber-500">{"★".repeat(review.rating)}<span className="text-slate-300">{"★".repeat(5 - review.rating)}</span></span></div><p className="mt-2 text-sm leading-6 text-slate-600">{review.comment}</p></article>) : <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">Ainda não há avaliações. Seja o primeiro a comentar.</p>}</div>
      </div>
    </section>
  </main>;
}
