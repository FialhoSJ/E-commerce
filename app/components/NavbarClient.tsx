'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Cart from './Cart';
import AccountButton from './AccountButton';
import AdminSignOut from './AdminSignOut';

const links = [
  { href: '/loja', label: 'Loja' },
  { href: '/loja', label: 'Decoração' },
  { href: '/loja', label: 'Acessórios' },
  { href: '/loja', label: 'Sob medida' },
  { href: '/#estudio', label: 'O estúdio' },
];

export default function NavbarClient({ isAdmin }: { isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const close = () => setOpen(false);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim();
    router.push(query ? `/loja?busca=${encodeURIComponent(query)}` : '/loja');
    close();
  };

  return (
    <header className="sticky top-0 z-50 text-[#151515] shadow-sm">
      {announcementVisible && (
        <div className="relative flex min-h-8 items-center justify-center bg-[#ff8700] px-10 text-center text-[9px] font-extrabold uppercase tracking-[.2em] text-[#171717] sm:text-[10px]">
          <span>Design autoral em impressão 3D · feito em camadas, feito para você</span>
          <button
            type="button"
            onClick={() => setAnnouncementVisible(false)}
            aria-label="Fechar aviso"
            className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-base font-normal leading-none hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      <div className="border-b border-[#e8e8e8] bg-white">
        <div className="mx-auto flex min-h-[76px] max-w-[1440px] flex-wrap items-center gap-4 px-5 py-3 sm:flex-nowrap sm:gap-5 sm:px-8 lg:gap-10 lg:px-12">
          <Link href="/" onClick={close} className="shrink-0 text-[30px] font-black leading-none tracking-[-.09em] text-[#0b2148] sm:text-[36px]">
            LACIS<span className="ml-0.5 align-top text-[14px] text-[#ff5c35]">✳</span>
            <span className="sr-only">Início</span>
          </Link>

          <form onSubmit={submitSearch} role="search" className="relative hidden w-full min-w-0 items-center sm:mx-auto sm:flex sm:max-w-[620px]">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Busque por produtos, ideias, materiais..."
              aria-label="Buscar produtos"
              className="h-11 w-full rounded-[5px] border border-[#c9c9c9] bg-white py-2 pl-4 pr-12 text-xs text-[#242622] outline-none transition placeholder:text-[#9b9b9b] focus:border-[#0b2148] focus:ring-2 focus:ring-[#0b2148]/10 sm:text-sm"
            />
            <button type="submit" aria-label="Buscar" className="absolute right-0 grid h-11 w-11 place-items-center text-[#111] transition hover:text-[#ef6b3b]">
              <svg aria-hidden="true" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <circle cx="10.8" cy="10.8" r="6.8" />
                <path d="m16 16 4.4 4.4" />
              </svg>
            </button>
          </form>

          <div className="ml-auto flex shrink-0 items-center gap-3 sm:ml-0 sm:gap-5">
            <Link href="/#estudio" className="hidden text-[10px] font-bold uppercase tracking-[.17em] transition hover:text-[#ef6b3b] lg:block">Sobre</Link>
            <Link href="/#contato" className="hidden text-[10px] font-bold uppercase tracking-[.17em] transition hover:text-[#ef6b3b] lg:block">Atendimento</Link>
            {isAdmin && <div className="hidden items-center gap-2 rounded-full bg-[#f3f0e8] px-3 py-2 text-xs font-bold text-[#55564f] xl:flex"><span className="h-2 w-2 rounded-full bg-[#6b7046]" /> Admin <Link href="/admin" className="underline underline-offset-4 hover:text-[#ef6b3b]">Painel</Link><AdminSignOut /></div>}
            <div className="hidden sm:block"><AccountButton /></div>
            <div className="hidden sm:block">
              <Cart compact />
            </div>
            <button type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-label={open ? 'Fechar menu' : 'Abrir menu'} className="grid h-10 w-10 place-items-center rounded border border-[#dedede] text-xl leading-none sm:hidden">
              {open ? '×' : '☰'}
            </button>
          </div>
        </div>
      </div>

      <nav aria-label="Navegação principal" className="hidden border-b border-[#e9e9e9] bg-[#f3f3f3] md:block">
        <div className="mx-auto flex min-h-[46px] max-w-[1440px] items-center justify-center gap-7 px-6 lg:gap-12">
          {links.map((link) => (
            <Link key={link.label} href={link.href} className="whitespace-nowrap py-3 text-[10px] font-semibold uppercase tracking-[.16em] transition hover:text-[#ef6b3b] lg:text-[11px]">
              {link.label}
            </Link>
          ))}
          <Link href="/loja" className="whitespace-nowrap py-3 text-[10px] font-bold uppercase tracking-[.16em] text-[#ff5c35] transition hover:text-[#c94924] lg:text-[11px]">Novidades</Link>
        </div>
      </nav>

      {open && (
        <div className="absolute inset-x-0 top-full border-t border-[#e6e6e6] bg-white px-5 py-4 shadow-lg sm:hidden">
          <nav aria-label="Navegação móvel" className="grid gap-1">
            <Link href="/loja" onClick={close} className="rounded px-3 py-3 text-xs font-bold uppercase tracking-[.14em] text-[#343434] hover:bg-[#f3f3f3]">Loja</Link>
            <Link href="/#estudio" onClick={close} className="rounded px-3 py-3 text-xs font-bold uppercase tracking-[.14em] text-[#343434] hover:bg-[#f3f3f3]">O estúdio</Link>
          </nav>
          <div className="mt-3 flex items-center justify-between border-t border-[#e9e9e9] pt-4"><AccountButton /><Cart /></div>
          {isAdmin && <div className="mt-4 flex items-center justify-between rounded bg-[#f3f0e8] px-4 py-3 text-sm font-bold text-[#55564f]"><Link href="/admin" onClick={close}>Abrir painel admin</Link><AdminSignOut /></div>}
        </div>
      )}
    </header>
  );
}
