'use client';

import Link from 'next/link';
import { useState } from 'react';
import Cart from './Cart';
import AccountButton from './AccountButton';
import AdminSignOut from './AdminSignOut';

const links = [
  { href: '/', label: 'Home' },
  { href: '/#sobre', label: 'Sobre nós' },
  { href: '/loja', label: 'Loja' },
];

export default function NavbarClient({ isAdmin }: { isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-[#f8faf9]/90 text-slate-900 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-4 px-5 lg:px-10">
          <Link href="/" onClick={close} className="flex shrink-0 items-center gap-3 text-sm font-black tracking-[0.2em]">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-xs text-white shadow-lg shadow-slate-950/15">3D</span>
            <span>STORE</span>
          </Link>

          <div className="hidden items-center gap-1 rounded-full border border-slate-200 bg-white/70 p-1 md:flex">
            {links.map((link) => <Link key={link.href} href={link.href} className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">{link.label}</Link>)}
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && <div className="hidden items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-bold text-teal-800 sm:flex"><span className="h-2 w-2 rounded-full bg-teal-500" /> Admin <Link href="/admin" className="underline decoration-teal-300 underline-offset-4 hover:text-teal-950">Painel</Link><AdminSignOut /></div>}
            <div className="hidden sm:block"><AccountButton /></div>
            <div className="hidden sm:block"><Cart /></div>
            <button type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-label={open ? 'Fechar menu' : 'Abrir menu'} className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-800 transition hover:border-slate-400 md:hidden">
              <span className="text-xl leading-none">{open ? '×' : '☰'}</span>
            </button>
          </div>
        </div>

        {open && <div className="border-t border-slate-200 bg-white px-5 py-4 md:hidden"><div className="grid gap-1">{links.map((link) => <Link key={link.href} href={link.href} onClick={close} className="rounded-xl px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50">{link.label}</Link>)}</div><div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-4"><AccountButton /><Cart /></div>{isAdmin && <div className="mt-4 flex items-center justify-between rounded-xl bg-teal-50 px-4 py-3 text-sm font-bold text-teal-800"><Link href="/admin" onClick={close}>Abrir painel admin</Link><AdminSignOut /></div>}</div>}
      </nav>
    </>
  );
}
