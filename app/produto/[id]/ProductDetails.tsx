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

  return <main className="mx-auto max-w-[1280px] px-6 py-10 text-[#242622] sm:px-10 lg:px-12">
    <Link href="/loja" className="text-xs font-bold uppercase tracking-[.16em] text-[#777568] transition hover:text-[#ef6b3b]">← Voltar para a loja</Link>
    <div className="mt-7 grid gap-8 rounded-[2rem] border border-[#d9d2c5] bg-[#f8f6f0] p-4 sm:p-7 lg:grid-cols-[1.1fr_.9fr]">
      <div className="product-card-image relative flex min-h-[360px] items-center justify-center overflow-hidden rounded-[1.5rem] bg-[#e9e4da] p-8 sm:min-h-[540px]"><div className="absolute inset-6 rounded-[50%] border border-[#c8bfae]" /><Image src={currentProduct.image} alt={currentProduct.title} unoptimized width={560} height={560} className="relative z-[1] max-h-[440px] w-full object-contain" priority /></div>
      <div className="flex flex-col justify-center">
        <p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#ef6b3b]">LACIS / {currentProduct.category}</p>
        <h1 className="mt-4 font-serif text-4xl leading-[1.02] tracking-[-.04em] sm:text-5xl">{currentProduct.title}</h1>
        <p className="mt-6 font-serif text-3xl">{currentProduct.price?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
        <div className="my-6 h-px w-full bg-[#d9d2c5]" />
        <p className="leading-7 text-[#66675d]">{currentProduct.description}</p>
        <div className="mt-6 grid grid-cols-2 gap-3 border-y border-[#d9d2c5] py-4 text-xs text-[#777568]"><div><span className="block font-bold uppercase tracking-[.12em] text-[#242622]">Produção</span><span className="mt-1 block">Feito sob demanda</span></div><div><span className="block font-bold uppercase tracking-[.12em] text-[#242622]">Material</span><span className="mt-1 block">Impressão 3D de qualidade</span></div></div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button onClick={add} className={`rounded-full border px-5 py-3.5 font-bold transition ${added ? "border-[#6b7046] bg-[#e8e9dd] text-[#555a34]" : "border-[#bdb5a8] text-[#242622] hover:border-[#ef6b3b] hover:text-[#c94924]"}`}>{added ? "✓ Adicionado" : "Adicionar ao carrinho"}</button>
          <button onClick={buyNow} className="rounded-full bg-[#ef6b3b] px-5 py-3.5 font-bold text-white transition hover:bg-[#c94924]">Comprar agora ↗</button>
        </div>
        {added && <Link href="/loja" className="mt-3 text-center text-sm font-semibold text-teal-700">Continuar comprando</Link>}
      </div>
    </div>

    <section className="mt-8 rounded-[2rem] border border-[#d9d2c5] bg-[#f8f6f0] p-6 sm:p-10">
      <div className="flex flex-col justify-between gap-3 border-b border-[#d9d2c5] pb-6 sm:flex-row sm:items-end">
        <div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#ef6b3b]">Experiência de compra</p><h2 className="mt-2 font-serif text-3xl">Comentários e avaliações</h2></div>
        <div className="text-left sm:text-right"><p className="font-serif text-2xl text-[#ef6b3b]">{averageRating ? averageRating.toFixed(1) : "—"} <span className="text-lg">★</span></p><p className="text-sm text-[#777568]">{productReviews.length} avaliação(ões)</p></div>
      </div>
      <div className="mt-6 grid gap-8 lg:grid-cols-[.85fr_1.15fr]">
        <form onSubmit={submitReview} className="rounded-2xl bg-[#eee9df] p-5">
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
