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
      <nav className="sticky top-0 z-50 border-b border-[#d9d2c5] bg-[#f3f0e8]/95 text-[#242622] backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-4 px-5 lg:px-10">
          <Link href="/" onClick={close} className="flex shrink-0 items-center gap-3 text-sm font-black tracking-[0.2em]">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#ef6b3b] text-xs text-white shadow-lg shadow-orange-950/15">L.</span>
            <span className="leading-none">LACIS<span className="mt-1 block text-[9px] font-semibold tracking-[0.18em] text-[#777568]">OBJETOS EM CAMADAS</span></span>
          </Link>

          <div className="hidden items-center gap-1 rounded-full border border-[#d9d2c5] bg-[#faf8f2] p-1 md:flex">
            {links.map((link) => <Link key={link.href} href={link.href} className="rounded-full px-4 py-2 text-sm font-semibold text-[#66675d] transition hover:bg-[#242622] hover:text-white">{link.label}</Link>)}
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && <div className="hidden items-center gap-2 rounded-full border border-[#d9d2c5] bg-[#e8e1d4] px-3 py-2 text-xs font-bold text-[#55564f] sm:flex"><span className="h-2 w-2 rounded-full bg-[#6b7046]" /> Admin <Link href="/admin" className="underline decoration-[#b8b69a] underline-offset-4 hover:text-[#ef6b3b]">Painel</Link><AdminSignOut /></div>}
            <div className="hidden sm:block"><AccountButton /></div>
            <div className="hidden sm:block"><Cart /></div>
            <button type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-label={open ? 'Fechar menu' : 'Abrir menu'} className="grid h-11 w-11 place-items-center rounded-xl border border-[#d9d2c5] bg-white text-[#242622] transition hover:border-[#ef6b3b] md:hidden">
              <span className="text-xl leading-none">{open ? '×' : '☰'}</span>
            </button>
          </div>
        </div>

        {open && <div className="border-t border-[#d9d2c5] bg-[#f8f6f0] px-5 py-4 md:hidden"><div className="grid gap-1">{links.map((link) => <Link key={link.href} href={link.href} onClick={close} className="rounded-xl px-4 py-3 font-semibold text-[#55564f] hover:bg-[#e8e1d4]">{link.label}</Link>)}</div><div className="mt-3 flex items-center justify-between border-t border-[#e5dfd4] pt-4"><AccountButton /><Cart /></div>{isAdmin && <div className="mt-4 flex items-center justify-between rounded-xl bg-[#e8e1d4] px-4 py-3 text-sm font-bold text-[#55564f]"><Link href="/admin" onClick={close}>Abrir painel admin</Link><AdminSignOut /></div>}</div>}
      </nav>
    </>
  );
}
