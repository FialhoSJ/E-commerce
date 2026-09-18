'use client';
import Link from 'next/link';
import { useStore } from './StoreProvider';

export default function AccountButton() {
  const { user, signOut } = useStore();
  return user ? <button onClick={signOut} className="rounded-full px-3 py-2 text-sm text-slate-600 hover:bg-slate-200">Olá, {user.name.split(' ')[0]} · Sair</button> : <Link href="/auth" className="rounded-full border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:border-slate-950">Entrar</Link>;
}
