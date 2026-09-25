'use client';
import Link from 'next/link';
import { useStore } from './StoreProvider';

export default function AccountButton() {
  const { user, signOut } = useStore();
  return user ? <button onClick={signOut} className="rounded-full px-3 py-2 text-sm text-[#66675d] hover:bg-[#e8e1d4]">Olá, {user.name.split(' ')[0]} · Sair</button> : <Link href="/auth" className="rounded-full border border-[#d9d2c5] px-3 py-2 text-sm font-semibold text-[#55564f] transition hover:border-[#ef6b3b] hover:text-[#c94924]">Entrar</Link>;
}
