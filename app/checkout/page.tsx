'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { useStore } from '../components/StoreProvider';

const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function CheckoutPage() {
  const router = useRouter();
  const { user, authReady, cart, cartTotal, saveOrder } = useStore();
  const [submitting, setSubmitting] = useState(false);
  const [cpf, setCpf] = useState('');

  useEffect(() => { if (authReady && !user) router.replace('/auth?redirect=/checkout'); }, [authReady, user, router]);
  if (!authReady || !user) return null;

  const handleCheckout = async () => {
    if (submitting) return;
    if (!cart.length) { toast.error('Seu carrinho está vazio.'); return; }
    setSubmitting(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart.map(({ id, quantity }) => ({ id, quantity })), cpf }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      saveOrder({
        id: data.order.id,
        items: data.order.items,
        total: data.order.total,
        subtotal: data.order.subtotal,
        status: data.order.status,
        date: data.order.createdAt,
        persistence: 'database',
      }, false);
      window.location.assign(data.checkoutUrl);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível iniciar o pagamento.');
    } finally {
      setSubmitting(false);
    }
  };

  return <main className="mx-auto max-w-6xl px-6 py-10 text-[#242622] sm:px-10">
    <Link href="/loja" className="text-xs font-bold uppercase tracking-[.16em] text-[#777568] hover:text-[#ef6b3b]">← Continuar comprando</Link>
    <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
      <section className="rounded-[1.7rem] border border-[#d9d2c5] bg-[#f8f6f0] p-6 sm:p-8">
        <p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#ef6b3b]">LACIS / Confirmação</p>
        <h1 className="mt-3 text-4xl tracking-[-.04em]">Confirme seu pedido</h1>
        <p className="mt-3 text-sm leading-6 text-[#777568]">Olá, {user.name.split(' ')[0]}. Confira os itens e o total antes de seguir para o checkout seguro do Asaas.</p>

        <div className="mt-8 rounded-2xl border border-[#e5ded2] bg-white/70 p-5">
          <p className="text-xs font-bold uppercase tracking-[.14em] text-[#777568]">Conta da compra</p>
          <p className="mt-2 font-semibold">{user.name}</p>
          <p className="mt-1 text-sm text-[#777568]">{user.email}</p>
        </div>

        <label className="mt-6 block text-sm font-semibold" htmlFor="checkout-cpf">CPF para pagamento
          <input id="checkout-cpf" name="cpf" type="text" inputMode="numeric" autoComplete="off" required maxLength={14} value={cpf} onChange={(event) => setCpf(event.target.value.replace(/[^\d.-]/g, '').slice(0, 14))} placeholder="000.000.000-00" className="mt-2 w-full rounded-xl border border-[#d9d2c5] bg-white px-4 py-3 text-[#242622] outline-none focus:border-[#ef6b3b]" />
          <span className="mt-1 block text-xs font-normal text-[#777568]">O Asaas solicita este dado para gerar a cobrança.</span>
        </label>

        {cart.length ? <div className="mt-7 space-y-4">
          <h2 className="font-bold">Itens do pedido</h2>
          {cart.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 border-b border-[#e5ded2] pb-4 text-sm last:border-0">
            <span>{item.quantity}× {item.title}</span>
            <strong className="whitespace-nowrap">{money((item.price || 0) * item.quantity)}</strong>
          </div>)}
        </div> : <div className="mt-8 rounded-xl bg-white p-5 text-sm text-[#777568]">Seu carrinho está vazio. <Link href="/loja" className="font-bold text-[#c94924] hover:underline">Voltar à loja</Link></div>}
      </section>

      <aside className="h-fit rounded-[1.7rem] border border-[#d9d2c5] bg-[#30332f] p-6 text-white sm:sticky sm:top-24 sm:p-8">
        <p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#ef8a62]">Seu pedido</p>
        <h2 className="mt-2 text-2xl">Resumo</h2>
        <div className="mt-5 flex justify-between border-y border-white/15 py-5 text-sm text-white/75"><span>Subtotal</span><span>{money(cartTotal)}</span></div>
        <div className="flex justify-between pt-5 text-xl"><span>Total</span><span>{money(cartTotal)}</span></div>
        <button onClick={handleCheckout} disabled={submitting || cart.length === 0} className="mt-6 w-full rounded-full bg-[#ef6b3b] px-4 py-3.5 font-bold text-white transition hover:bg-white hover:text-[#242622] disabled:cursor-not-allowed disabled:opacity-50">
          {submitting ? 'Preparando pagamento...' : 'Continuar para pagamento ↗'}
        </button>
        <p className="mt-3 text-xs leading-5 text-white/55">Você será direcionado ao Asaas para escolher a forma de pagamento. O pedido só será confirmado após a confirmação do pagamento.</p>
      </aside>
    </div>
  </main>;
}
