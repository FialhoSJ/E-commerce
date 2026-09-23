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
      saveOrder({ id: data.order.id, items: cart, total: data.order.total, subtotal: data.order.subtotal, shipping: data.order.shipping.price, status: data.order.status, date: data.order.createdAt });
      toast.success('Pedido criado. Pagamento pendente.');
      router.push('/checkout/success');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível criar o pedido.'); }
    finally { setSubmitting(false); }
  };

  return <main className="mx-auto max-w-4xl px-6 py-10 text-slate-900"><Link href="/" className="text-sm text-teal-700">← Continuar comprando</Link><form onSubmit={handleCheckout} className="mt-5 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
    <section className="rounded-3xl bg-white p-8 shadow-xl"><p className="text-sm font-semibold uppercase tracking-wider text-teal-700">Etapa final</p><h1 className="mt-2 text-3xl font-bold">Entrega do pedido</h1><p className="mt-2 text-slate-500">Olá, {user.name.split(' ')[0]}. Informe o endereço para calcular as opções de envio.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium sm:col-span-2">CEP<input required value={address.postalCode} onChange={(event) => setField('postalCode', event.target.value)} placeholder="00000-000" className="auth-input" /></label>
        <label className="text-sm font-medium sm:col-span-2">Rua<input required value={address.street} onChange={(event) => setField('street', event.target.value)} className="auth-input" /></label>
        <label className="text-sm font-medium">Número<input required value={address.number} onChange={(event) => setField('number', event.target.value)} className="auth-input" /></label>
        <label className="text-sm font-medium">Complemento<input value={address.complement} onChange={(event) => setField('complement', event.target.value)} className="auth-input" /></label>
        <label className="text-sm font-medium">Bairro<input required value={address.neighborhood} onChange={(event) => setField('neighborhood', event.target.value)} className="auth-input" /></label>
        <label className="text-sm font-medium">Cidade<input required value={address.city} onChange={(event) => setField('city', event.target.value)} className="auth-input" /></label>
        <label className="text-sm font-medium">UF<input required maxLength={2} value={address.state} onChange={(event) => setField('state', event.target.value.toUpperCase())} className="auth-input" /></label>
      </div>
      <button type="button" onClick={quoteShipping} disabled={loadingShipping} className="mt-6 rounded-xl border border-teal-600 px-4 py-3 font-bold text-teal-700 disabled:opacity-50">{loadingShipping ? 'Calculando...' : 'Calcular frete'}</button>
      {options.length > 0 && <div className="mt-6 space-y-3"><h2 className="font-bold">Escolha a entrega</h2>{options.map((option) => <label key={option.id} className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 ${shippingId === option.id ? 'border-teal-600 bg-teal-50' : 'border-slate-200'}`}><span className="flex gap-3"><input type="radio" name="shipping" checked={shippingId === option.id} onChange={() => setShippingId(option.id)} /><span><strong>{option.name}</strong><small className="block text-slate-500">{option.description} · até {option.deliveryDays} dias úteis</small></span></span><strong>{option.price ? money(option.price) : 'Grátis'}</strong></label>)}</div>}
    </section>
    <aside className="h-fit rounded-3xl bg-white p-8 shadow-xl"><h2 className="text-xl font-bold">Resumo</h2><div className="mt-5 space-y-3 border-y py-5 text-sm">{cart.map((item) => <div key={item.id} className="flex justify-between gap-4"><span>{item.quantity}× {item.title}</span><span>{money((item.price || 0) * item.quantity)}</span></div>)}<div className="flex justify-between"><span>Subtotal</span><span>{money(cartTotal)}</span></div>{selectedShipping && <div className="flex justify-between"><span>Frete</span><span>{selectedShipping.price ? money(selectedShipping.price) : 'Grátis'}</span></div>}</div><div className="flex justify-between text-xl font-bold"><span>Total</span><span>{money(cartTotal + (selectedShipping?.price ?? 0))}</span></div><button disabled={submitting || !selectedShipping} className="mt-6 w-full rounded-xl bg-teal-600 px-4 py-3 font-bold text-white hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-50">{submitting ? 'Criando pedido...' : 'Continuar para pagamento'}</button><p className="mt-3 text-xs text-slate-500">O pedido será criado como pendente até a integração do gateway de pagamento.</p></aside>
  </form></main>;
}
