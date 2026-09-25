'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { useStore } from '../components/StoreProvider';
import type { ShippingAddress, ShippingOption } from '@/lib/shipping';

const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const initialAddress: ShippingAddress = { postalCode: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' };

export default function CheckoutPage() {
  const router = useRouter();
  const { user, cart, cartTotal, saveOrder } = useStore();
  const [address, setAddress] = useState(initialAddress);
  const [options, setOptions] = useState<ShippingOption[]>([]);
  const [shippingId, setShippingId] = useState('');
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (!user) router.replace('/auth?redirect=/checkout'); }, [user, router]);
  if (!user) return null;

  const selectedShipping = options.find((option) => option.id === shippingId);
  const setField = (field: keyof ShippingAddress, value: string) => setAddress((current) => ({ ...current, [field]: value }));

  const quoteShipping = async () => {
    setLoadingShipping(true); setOptions([]); setShippingId('');
    try {
      const response = await fetch('/api/shipping/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postalCode: address.postalCode, subtotal: cartTotal }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setOptions(data.options); setShippingId(data.options[0]?.id ?? '');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível calcular o frete.'); }
    finally { setLoadingShipping(false); }
  };

  const handleCheckout = async (event: FormEvent) => {
    event.preventDefault();
    if (!cart.length) { toast.error('Seu carrinho está vazio.'); return; }
    if (!selectedShipping) { toast.error('Calcule e escolha o frete.'); return; }
    setSubmitting(true);
    try {
      const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: user.email, items: cart, address, shipping: selectedShipping }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      saveOrder({ id: data.order.id, items: cart, total: data.order.total, subtotal: data.order.subtotal, shipping: data.order.shipping.price, status: data.order.status, date: data.order.createdAt, persistence: data.persistence });
      if (data.persistence === 'local') toast.warning(data.message || 'Pedido salvo somente neste navegador.');
      else toast.success('Pedido criado. Pagamento pendente.');
      router.push('/checkout/success');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível criar o pedido.'); }
    finally { setSubmitting(false); }
  };

  return <main className="mx-auto max-w-6xl px-6 py-10 text-[#242622] sm:px-10"><Link href="/loja" className="text-xs font-bold uppercase tracking-[.16em] text-[#777568] hover:text-[#ef6b3b]">← Continuar comprando</Link><form onSubmit={handleCheckout} className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
    <section className="rounded-[1.7rem] border border-[#d9d2c5] bg-[#f8f6f0] p-6 sm:p-8"><p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#ef6b3b]">LACIS / Etapa final</p><h1 className="mt-3 font-serif text-4xl tracking-[-.04em]">Para onde vai<br className="hidden sm:block" /> sua peça?</h1><p className="mt-3 text-sm leading-6 text-[#777568]">Olá, {user.name.split(' ')[0]}. Informe o endereço para calcular as opções de envio.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium sm:col-span-2">CEP<input required value={address.postalCode} onChange={(event) => setField('postalCode', event.target.value)} placeholder="00000-000" className="auth-input" /></label>
        <label className="text-sm font-medium sm:col-span-2">Rua<input required value={address.street} onChange={(event) => setField('street', event.target.value)} className="auth-input" /></label>
        <label className="text-sm font-medium">Número<input required value={address.number} onChange={(event) => setField('number', event.target.value)} className="auth-input" /></label>
        <label className="text-sm font-medium">Complemento<input value={address.complement} onChange={(event) => setField('complement', event.target.value)} className="auth-input" /></label>
        <label className="text-sm font-medium">Bairro<input required value={address.neighborhood} onChange={(event) => setField('neighborhood', event.target.value)} className="auth-input" /></label>
        <label className="text-sm font-medium">Cidade<input required value={address.city} onChange={(event) => setField('city', event.target.value)} className="auth-input" /></label>
        <label className="text-sm font-medium">UF<input required maxLength={2} value={address.state} onChange={(event) => setField('state', event.target.value.toUpperCase())} className="auth-input" /></label>
      </div>
      <button type="button" onClick={quoteShipping} disabled={loadingShipping} className="mt-6 rounded-full border border-[#ef6b3b] px-5 py-3 font-bold text-[#c94924] transition hover:bg-[#ef6b3b] hover:text-white disabled:opacity-50">{loadingShipping ? 'Calculando...' : 'Calcular frete ↗'}</button>
      {options.length > 0 && <div className="mt-6 space-y-3"><h2 className="font-bold">Escolha a entrega</h2>{options.map((option) => <label key={option.id} className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition ${shippingId === option.id ? 'border-[#ef6b3b] bg-[#fff0e9]' : 'border-[#d9d2c5] bg-white'}`}><span className="flex gap-3"><input type="radio" name="shipping" checked={shippingId === option.id} onChange={() => setShippingId(option.id)} className="accent-[#ef6b3b]" /><span><strong>{option.name}</strong><small className="block text-[#777568]">{option.description} · até {option.deliveryDays} dias úteis</small></span></span><strong>{option.price ? money(option.price) : 'Grátis'}</strong></label>)}</div>}
    </section>
    <aside className="h-fit rounded-[1.7rem] border border-[#d9d2c5] bg-[#30332f] p-6 text-white sm:sticky sm:top-24 sm:p-8"><p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#ef8a62]">Seu pedido</p><h2 className="mt-2 font-serif text-2xl">Resumo</h2><div className="mt-5 space-y-3 border-y border-white/15 py-5 text-sm text-white/75">{cart.map((item) => <div key={item.id} className="flex justify-between gap-4"><span>{item.quantity}× {item.title}</span><span>{money((item.price || 0) * item.quantity)}</span></div>)}<div className="flex justify-between"><span>Subtotal</span><span>{money(cartTotal)}</span></div>{selectedShipping && <div className="flex justify-between"><span>Frete</span><span>{selectedShipping.price ? money(selectedShipping.price) : 'Grátis'}</span></div>}</div><div className="flex justify-between font-serif text-xl"><span>Total</span><span>{money(cartTotal + (selectedShipping?.price ?? 0))}</span></div><button disabled={submitting || !selectedShipping} className="mt-6 w-full rounded-full bg-[#ef6b3b] px-4 py-3.5 font-bold text-white transition hover:bg-white hover:text-[#242622] disabled:cursor-not-allowed disabled:opacity-50">{submitting ? 'Criando pedido...' : 'Continuar para pagamento ↗'}</button><p className="mt-3 text-xs leading-5 text-white/45">O pedido será criado como pendente até a integração do gateway de pagamento.</p></aside>
  </form></main>;
}
