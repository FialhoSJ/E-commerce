'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useStore } from '../components/StoreProvider';

type Mode = 'login' | 'signup' | 'forgot';

function safeRedirect(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return '/';
  return value;
}

export default function AuthPage() {
  const router = useRouter();
  const { user, authReady, signIn, signUp, requestPasswordReset } = useStore();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirect] = useState(() => {
    if (typeof window === 'undefined') return '/';
    return safeRedirect(new URLSearchParams(window.location.search).get('redirect'));
  });
  const adminRedirect = redirect === '/admin';

  useEffect(() => {
    if (authReady && user && !adminRedirect && mode !== 'forgot') router.replace(redirect);
  }, [authReady, user, router, redirect, adminRedirect, mode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const errorCode = params.get('error');
    if (errorCode === 'email-confirmation') setError('O link de confirmação expirou ou é inválido. Solicite um novo e-mail.');
    if (errorCode === 'auth-configuration') setError('A autenticação ainda não está configurada no servidor.');
  }, []);

  const changeMode = (next: Mode) => {
    if (isSubmitting) return;
    setMode(next);
    setError('');
    setMessage('');
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'forgot') {
        const result = await requestPasswordReset(email);
        if (result) setError(result);
        else setMessage('Se houver uma conta para esse e-mail, enviaremos um link para redefinir a senha.');
        return;
      }

      if (password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres.');
        return;
      }

      if (mode === 'login') {
        try {
          const response = await fetch('/api/auth/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          const data = await response.json().catch(() => ({}));
          if (response.ok) {
            toast.success('Acesso administrativo autorizado.');
            router.push('/admin');
            return;
          }
          if (adminRedirect) {
            setError(data.error || 'Não foi possível entrar como administrador.');
            return;
          }
        } catch {
          if (adminRedirect) {
            setError('Não foi possível conectar ao servidor. Confira sua conexão e tente novamente.');
            return;
          }
        }

        const result = await signIn(email, password);
        if (result) setError(result);
        else {
          toast.success('Login realizado com sucesso!');
          router.replace(redirect);
        }
        return;
      }

      const result = await signUp(name, email, password, redirect);
      if (result.error) {
        setError(result.error);
      } else if (result.needsEmailConfirmation) {
        setMessage('Conta criada. Abra o link enviado ao seu e-mail para confirmar o endereço e entrar.');
      } else {
        toast.success('Conta criada com sucesso!');
        router.replace(redirect);
      }
    } catch {
      setError('Não foi possível concluir sua solicitação. Tente novamente em instantes.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return <main className="mx-auto flex min-h-[calc(100vh-76px)] max-w-6xl items-center justify-center px-5 py-10 sm:px-8"><section className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-[#d9d2c5] bg-[#f8f6f0] p-7 text-[#242622] shadow-[0_24px_70px_-42px_rgba(36,38,34,.55)] sm:p-10">
    <div className="absolute -right-16 -top-20 h-44 w-44 rounded-full border border-[#ef6b3b]/20" /><div className="absolute -right-9 -top-12 h-28 w-28 rounded-full border border-[#ef6b3b]/20" />
    <Link href="/" className="relative text-xs font-bold uppercase tracking-[.16em] text-[#777568] transition hover:text-[#ef6b3b]">← Voltar para a loja</Link>
    <p className="relative mt-8 text-[10px] font-bold uppercase tracking-[.22em] text-[#ef6b3b]">LACIS / Conta</p>
    <h1 className="relative mt-3 text-4xl tracking-[-.04em]">{mode === 'forgot' ? 'Recuperar senha' : mode === 'signup' ? 'Criar sua conta' : 'Entre no estúdio'}</h1>
    <p className="mt-3 text-sm leading-6 text-[#777568]">{mode === 'forgot' ? 'Informe seu e-mail para receber um link seguro de redefinição.' : mode === 'signup' ? 'Crie sua conta para acompanhar pedidos e salvar seus dados.' : 'Acesse sua conta para acompanhar pedidos e continuar sua compra.'}</p>
    <form onSubmit={submit} className="mt-6 space-y-4" aria-busy={isSubmitting}>
      <fieldset disabled={isSubmitting} className="space-y-4 disabled:opacity-70">
      {mode === 'signup' && <label className="block text-sm font-medium">Nome<input required value={name} onChange={(event) => setName(event.target.value)} className="auth-input" placeholder="Seu nome" autoComplete="name" /></label>}
      <label className="block text-sm font-medium">E-mail<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="auth-input" placeholder="voce@email.com" autoComplete="email" /></label>
      {mode !== 'forgot' && <label className="block text-sm font-medium">Senha<input required type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} className="auth-input" placeholder="Mínimo de 6 caracteres" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} /></label>}
      </fieldset>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
      <button disabled={isSubmitting} className="w-full rounded-full bg-[#ef6b3b] px-4 py-3.5 font-bold text-white transition hover:bg-[#c94924] disabled:cursor-wait disabled:opacity-70">{isSubmitting ? 'Aguarde...' : mode === 'forgot' ? 'Enviar link' : mode === 'signup' ? 'Criar conta' : 'Entrar ↗'}</button>
    </form>
    <div className="mt-6 text-center text-sm text-[#66675d]">
      {mode === 'login' && <><button type="button" disabled={isSubmitting} onClick={() => changeMode('forgot')} className="text-[#c94924] hover:underline disabled:opacity-60">Esqueci minha senha</button><p className="mt-3">Ainda não tem conta? <button type="button" disabled={isSubmitting} onClick={() => changeMode('signup')} className="font-bold text-[#c94924] disabled:opacity-60">Cadastre-se</button></p></>}
      {mode === 'signup' && <p>Já tem uma conta? <button type="button" disabled={isSubmitting} onClick={() => changeMode('login')} className="font-bold text-[#c94924] disabled:opacity-60">Entrar</button></p>}
      {mode === 'forgot' && <button type="button" disabled={isSubmitting} onClick={() => changeMode('login')} className="font-bold text-[#c94924] disabled:opacity-60">Voltar para o login</button>}
    </div>
  </section></main>;
}
