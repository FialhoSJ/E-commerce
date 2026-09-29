'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import ConfirmDialog from './ConfirmDialog';

export default function AdminSignOut() {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const signOut = async () => {
    setBusy(true);
    try {
      const response = await fetch('/api/auth/admin', { method: 'DELETE' });
      if (!response.ok) throw new Error('Não foi possível encerrar a sessão administrativa. Tente novamente.');
      setConfirmOpen(false);
      toast.success('Sessão administrativa encerrada.');
      router.push('/');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível sair. Tente novamente.');
    } finally {
      setBusy(false);
    }
  };

  return <>
    <button type="button" onClick={() => setConfirmOpen(true)} className="ml-2 text-xs text-slate-500 hover:text-slate-950">Sair</button>
    <ConfirmDialog open={confirmOpen} title="Encerrar sessão administrativa?" description="Será necessário entrar novamente para abrir o painel e gerenciar a loja." confirmLabel="Sair do painel" busy={busy} onCancel={() => setConfirmOpen(false)} onConfirm={signOut} />
  </>;
}
