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
    <main className="mx-auto max-w-3xl px-6 py-10 text-[#242622] sm:px-8">
      <Link href="/" className="text-xs font-bold uppercase tracking-[.16em] text-[#777568] hover:text-[#ef6b3b]">← Voltar ao início</Link>
      <motion.div
        className="mt-5 rounded-[1.8rem] border border-[#d9d2c5] bg-[#f8f6f0] p-7 shadow-[0_24px_70px_-42px_rgba(36,38,34,.55)] sm:p-10"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <motion.div
          className="grid h-14 w-14 place-items-center rounded-full bg-[#e6e6d7] text-3xl text-[#6b7046]"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.2 }}
        >
          ✓
        </motion.div>
        <p className="mt-4 text-[10px] font-bold uppercase tracking-[.22em] text-[#ef6b3b]">Pedido concluído</p>
        <h1 className="mt-2 font-serif text-4xl tracking-[-.04em]">Obrigado, {user.name.split(' ')[0]}!</h1>
        <p className="mt-2 text-[#777568]">
          {lastOrder?.persistence === 'local'
            ? 'Este pedido foi salvo somente neste navegador e ainda não está sincronizado com o banco de dados.'
            : `Seu pedido foi registrado com sucesso${lastOrder ? ` com o número ${lastOrder.id}` : ''}.`}
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
            {lastOrder.shipping !== undefined && <div className="mt-3 flex justify-between text-sm text-slate-500"><span>Frete</span><span>{lastOrder.shipping ? money(lastOrder.shipping) : 'Grátis'}</span></div>}
            {lastOrder.status && <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">Status: pagamento pendente. O pedido será atualizado após a confirmação do gateway.</p>}
          </>
        ) : (
          <p className="mt-8 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
            Não encontramos os detalhes deste pedido, mas ele foi registrado com sucesso.
          </p>
        )}
        <p className="mt-4 text-sm text-teal-700">Você receberá um e‑mail com os detalhes do pedido.</p>
        <Link href="/loja" className="mt-6 inline-block rounded-full bg-[#ef6b3b] px-6 py-3.5 font-bold text-white transition hover:bg-[#c94924]">Continuar comprando ↗</Link>
      </motion.div>
    </main>
  );
}
