'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useStore } from '@/app/components/StoreProvider';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { resetPassword } = useStore();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmation) {
      setError('As senhas não conferem.');
      return;
    }

    setSubmitting(true);
    const result = await resetPassword(password);
    setSubmitting(false);
    if (result) {
      setError(result);
      return;
    }
    toast.success('Senha redefinida com sucesso.');
    router.replace('/');
  };

  return <main className="mx-auto flex min-h-[calc(100vh-76px)] max-w-6xl items-center justify-center px-5 py-10 sm:px-8"><section className="w-full max-w-md rounded-[2rem] border border-[#d9d2c5] bg-[#f8f6f0] p-7 text-[#242622] shadow-[0_24px_70px_-42px_rgba(36,38,34,.55)] sm:p-10">
    <p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#ef6b3b]">LACIS / Conta</p>
    <h1 className="mt-3 text-4xl tracking-[-.04em]">Criar nova senha</h1>
    <p className="mt-3 text-sm leading-6 text-[#777568]">Escolha uma senha com pelo menos 6 caracteres.</p>
    <form onSubmit={submit} className="mt-6 space-y-4">
      <label className="block text-sm font-medium">Nova senha<input required type="password" minLength={6} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="auth-input" /></label>
      <label className="block text-sm font-medium">Repita a nova senha<input required type="password" minLength={6} autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="auth-input" /></label>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button disabled={submitting} className="w-full rounded-full bg-[#ef6b3b] px-4 py-3.5 font-bold text-white transition hover:bg-[#c94924] disabled:opacity-50">{submitting ? 'Salvando...' : 'Salvar nova senha'}</button>
    </form>
  </section></main>;
}
