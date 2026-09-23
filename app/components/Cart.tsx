'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { useStore } from './StoreProvider';
import Image from 'next/image';

const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Cart() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { cart, cartCount, cartTotal, user, updateQuantity, removeFromCart } = useStore();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const checkout = () => {
    setOpen(false);
    router.push(user ? '/checkout' : '/auth?redirect=/checkout');
  };

  const remove = (id: number, title: string) => {
    removeFromCart(id);
    toast(`${title} removido do carrinho.`);
  };

  return <>
    <button onClick={() => setOpen(true)} className="relative rounded-full px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200" aria-label="Abrir carrinho">
      <span className="inline-flex items-center gap-2">
        <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 1.9-1.5L20.5 8H6" />
          <circle cx="10" cy="20" r="1" />
          <circle cx="18" cy="20" r="1" />
        </svg>
        <span className="hidden sm:inline">Carrinho</span>
        {cartCount > 0 && <span className="rounded-full bg-teal-400 px-2 py-0.5 text-xs text-slate-950">{cartCount}</span>}
      </span>
    </button>

    {mounted && createPortal(
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] bg-slate-950/60"
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.aside
              className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col overflow-hidden bg-white p-6 text-slate-900 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            >
              <div className="flex shrink-0 items-center justify-between border-b border-slate-200 pb-5">
                <h2 className="text-xl font-bold">Seu carrinho</h2>
                <button onClick={() => setOpen(false)} className="rounded-full p-2 text-2xl leading-none hover:bg-slate-100" aria-label="Fechar carrinho">×</button>
              </div>
              {cart.length === 0 ? (
                <p className="mt-10 text-center text-slate-500">Seu carrinho está vazio.</p>
              ) : (
                <>
                  <div className="mt-6 min-h-0 flex-1 space-y-4 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-3 border-b pb-4">
                        <Image src={item.image} alt="" unoptimized width={64} height={64} className="h-16 w-16 object-contain" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold">{item.title}</p>
                          <p className="text-sm text-teal-700">{money(item.price || 0)}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="rounded bg-slate-100 px-2">−</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="rounded bg-slate-100 px-2">+</button>
                            <button onClick={() => remove(item.id, item.title)} className="ml-auto text-xs text-red-600">Remover</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="shrink-0 border-t bg-white pt-5">
                    <div className="mb-4 flex justify-between font-bold"><span>Total</span><span>{money(cartTotal)}</span></div>
                    <button onClick={checkout} className="w-full rounded-xl bg-teal-600 px-4 py-3 font-bold text-white hover:bg-teal-500">Ir para checkout</button>
                    {!user && <p className="mt-2 text-center text-xs text-slate-500">Você poderá entrar ou criar sua conta no próximo passo.</p>}
                  </div>
                </>
              )}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )}
  </>;
}
