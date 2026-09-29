'use client';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { useStore } from './StoreProvider';
import ConfirmDialog from './ConfirmDialog';

export default function AccountButton() {
  const { user, signOut } = useStore();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSignOut = async () => {
    setBusy(true);
    const error = await signOut();
    setBusy(false);
    if (error) {
      toast.error(error);
      return;
    }
    setConfirmOpen(false);
    toast.success('Você saiu da sua conta.');
  };

  return user ? <>
    <button type="button" onClick={() => setConfirmOpen(true)} className="rounded-full px-3 py-2 text-sm text-[#66675d] transition hover:bg-[#e8e1d4]">Olá, {user.name.split(' ')[0]} · Sair</button>
    <ConfirmDialog open={confirmOpen} title="Sair da sua conta?" description="Você precisará entrar novamente para acessar sua conta e continuar a compra." confirmLabel="Sair da conta" busy={busy} onCancel={() => setConfirmOpen(false)} onConfirm={handleSignOut} />
  </> : <Link href="/auth" className="rounded-full border border-[#d9d2c5] px-3 py-2 text-sm font-semibold text-[#55564f] transition hover:border-[#ef6b3b] hover:text-[#c94924]">Entrar</Link>;
}
