'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { useStore } from '../components/StoreProvider';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, cart, cartTotal, completeOrder } = useStore();
  useEffect(() => { if (!user) router.replace('/auth?redirect=/checkout'); }, [user, router]);
  if (!user) return null;
  const handleCheckout = () => {
    if (cart.length === 0) { toast.error('Seu carrinho está vazio.'); return; }
    const order = completeOrder();
    if (order) { toast.success('Pedido confirmado com sucesso!'); router.push('/checkout/success'); }
  };
  return <main className="mx-auto max-w-3xl py-10 text-slate-900"><Link href="/" className="text-sm text-teal-700">← Continuar comprando</Link><div className="mt-5 rounded-3xl bg-white p-8 shadow-xl"><p className="text-sm font-semibold uppercase tracking-wider text-teal-700">Etapa final</p><h1 className="mt-2 text-3xl font-bold">Olá, {user.name.split(' ')[0]}!</h1><p className="mt-2 text-slate-500">Sua conta está autenticada. Agora você pode continuar com endereço e pagamento.</p><div className="mt-8 space-y-3 border-y py-5">{cart.map((item) => <div key={item.id} className="flex justify-between gap-4 text-sm"><span>{item.quantity}× {item.title}</span><span>R$ {((item.price || 0) * item.quantity).toFixed(2).replace('.', ',')}</span></div>)}</div><div className="mt-5 flex justify-between text-xl font-bold"><span>Total</span><span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span></div><button onClick={handleCheckout} className="mt-6 w-full rounded-xl bg-teal-600 px-4 py-3 font-bold text-white hover:bg-teal-500">Continuar para pagamento</button></div></main>;
}
