'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useStore } from '../../components/StoreProvider';

const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function SuccessPage() {
  const router = useRouter();
  const { user, lastOrder } = useStore();

  useEffect(() => {
    if (!user) router.replace('/auth?redirect=/checkout/success');
  }, [user, router]);

  if (!user) return null;

  return (
    <main className="mx-auto max-w-3xl py-10 text-slate-900">
      <Link href="/" className="text-sm text-teal-700">← Voltar ao início</Link>
      <motion.div
        className="mt-5 rounded-3xl bg-white p-8 shadow-xl"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <motion.div
          className="grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-3xl"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.2 }}
        >
          ✓
        </motion.div>
        <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-teal-700">Pedido concluído</p>
        <h1 className="mt-2 text-3xl font-bold">Obrigado, {user.name.split(' ')[0]}!</h1>
        <p className="mt-2 text-slate-500">
          Seu pedido foi registrado com sucesso{lastOrder ? ` com o número ${lastOrder.id}` : ''}.
        </p>
        {lastOrder ? (
          <>
            <div className="mt-8 space-y-3 border-y py-5">
              {lastOrder.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-4 text-sm">
                  <span>{item.quantity}× {item.title}</span>
                  <span>{money((item.price || 0) * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex justify-between text-xl font-bold">
              <span>Total</span>
              <span>{money(lastOrder.total)}</span>
            </div>
          </>
        ) : (
          <p className="mt-8 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
            Não encontramos os detalhes deste pedido, mas ele foi registrado com sucesso.
          </p>
        )}
        <p className="mt-4 text-sm text-teal-700">Você receberá um e‑mail com os detalhes do pedido.</p>
        <Link href="/loja" className="mt-6 inline-block rounded-xl bg-teal-600 px-4 py-3 font-semibold text-white hover:bg-teal-500">Continuar comprando</Link>
      </motion.div>
    </main>
  );
}
