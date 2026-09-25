'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useStore } from '../components/StoreProvider';

type Mode = 'login' | 'signup' | 'forgot';
type ResetStep = 'email' | 'otp' | 'password';

export default function AuthPage() {
  const router = useRouter();
  const { user, signIn, signUp, requestPasswordReset, verifyPasswordReset, resetPassword } = useStore();
  const [mode, setMode] = useState<Mode>('login');
  const [resetStep, setResetStep] = useState<ResetStep>('email');
  const [name, setName] = useState(''); const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); const [confirmPassword, setConfirmPassword] = useState(''); const [otp, setOtp] = useState('');
  const [message, setMessage] = useState(''); const [error, setError] = useState('');
  const [redirect] = useState(() => typeof window === 'undefined' ? '/' : new URLSearchParams(window.location.search).get('redirect') || '/');
  const adminRedirect = redirect === '/admin';
  useEffect(() => { if (user && !adminRedirect) router.replace(redirect); }, [user, router, redirect, adminRedirect]);
  const changeMode = (next: Mode) => { setMode(next); setError(''); setMessage(''); setResetStep('email'); };
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError(''); setMessage('');
    if (mode === 'login') {
      try {
        const response = await fetch('/api/auth/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
        const data = await response.json().catch(() => ({}));
        if (response.ok) {
          toast.success('Acesso administrativo autorizado.');
          router.push('/admin');
          return;
        }
        if (adminRedirect) { setError(data.error || 'Nao foi possivel entrar como administrador.'); return; }
      } catch {
        if (adminRedirect) { setError('Nao foi possivel conectar ao servidor.'); return; }
      }
    }
    if (mode === 'forgot') {
      if (resetStep === 'email') {
        requestPasswordReset(email);
        setResetStep('otp');
        setMessage('Se o endereço de e-mail for válido, você receberá uma senha única por e-mail. Digite-a abaixo.');
        return;
      }
      if (resetStep === 'otp') {
        const result = verifyPasswordReset(email, otp);
        if (result) setError(result); else { setResetStep('password'); setMessage('Código validado. Crie uma nova senha.'); }
        return;
      }
      if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return; }
      if (password !== confirmPassword) { setError('As senhas não conferem.'); return; }
      if (resetPassword(email, password)) { toast.success('Senha redefinida com sucesso!'); setMessage('Senha redefinida com sucesso.'); setTimeout(() => changeMode('login'), 900); } else setError('Não foi possível concluir. Solicite um novo código.');
      return;
    }
    if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return; }
    if (mode === 'login' && adminRedirect) {
      try {
        const response = await fetch('/api/auth/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
        const data = await response.json();
        if (!response.ok) { setError(data.error || 'Não foi possível entrar como administrador.'); return; }
        toast.success('Acesso administrativo autorizado.');
        router.push('/admin');
      } catch { setError('Não foi possível conectar ao servidor.'); }
      return;
    }
    const result = mode === 'login' ? signIn(email, password) : signUp(name, email, password);
    if (result) setError(result);
    else { toast.success(mode === 'login' ? 'Login realizado com sucesso!' : 'Conta criada com sucesso!'); router.push(redirect); }
  };

  const forgotTitle = resetStep === 'email' ? 'Recuperar senha' : resetStep === 'otp' ? 'Digite o código' : 'Criar nova senha';
  return <main className="mx-auto flex min-h-[calc(100vh-76px)] max-w-6xl items-center justify-center px-5 py-10 sm:px-8"><section className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-[#d9d2c5] bg-[#f8f6f0] p-7 text-[#242622] shadow-[0_24px_70px_-42px_rgba(36,38,34,.55)] sm:p-10">
    <div className="absolute -right-16 -top-20 h-44 w-44 rounded-full border border-[#ef6b3b]/20" /><div className="absolute -right-9 -top-12 h-28 w-28 rounded-full border border-[#ef6b3b]/20" />
    <Link href="/" className="relative text-xs font-bold uppercase tracking-[.16em] text-[#777568] transition hover:text-[#ef6b3b]">← Voltar para a loja</Link>
    <p className="relative mt-8 text-[10px] font-bold uppercase tracking-[.22em] text-[#ef6b3b]">LACIS / Conta</p>
    <h1 className="relative mt-3 font-serif text-4xl tracking-[-.04em]">{mode === 'forgot' ? forgotTitle : mode === 'signup' ? 'Criar sua conta' : 'Entre no estúdio'}</h1>
    <p className="mt-3 text-sm leading-6 text-[#777568]">{mode === 'forgot' ? resetStep === 'email' ? 'Informe seu e-mail para receber um código de uso único.' : resetStep === 'otp' ? 'O código é válido por 10 minutos. Confira sua caixa de entrada.' : 'Escolha uma senha nova para sua conta.' : 'Entre para acompanhar seu pedido e continuar sua compra.'}</p>
    <form onSubmit={submit} className="mt-6 space-y-4">
      {mode === 'signup' && <label className="block text-sm font-medium">Nome<input required value={name} onChange={(event) => setName(event.target.value)} className="auth-input" placeholder="Seu nome" /></label>}
      {(mode !== 'forgot' || resetStep === 'email') && <label className="block text-sm font-medium">E-mail<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="auth-input" placeholder="voce@email.com" /></label>}
      {mode === 'forgot' && resetStep === 'otp' && <label className="block text-sm font-medium">Senha única<input required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))} className="auth-input tracking-[0.4em]" placeholder="000000" /></label>}
      {mode === 'forgot' && resetStep === 'password' && <><label className="block text-sm font-medium">Nova senha<input required type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} className="auth-input" placeholder="Mínimo de 6 caracteres" /></label><p className="-mt-2 text-xs text-slate-500">Use pelo menos 6 caracteres.</p><label className="block text-sm font-medium">Repita a nova senha<input required type="password" minLength={6} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="auth-input" placeholder="Digite novamente" /></label></>}
      {mode !== 'forgot' && <label className="block text-sm font-medium">Senha<input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="auth-input" placeholder="Mínimo de 6 caracteres" /></label>}
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}{message && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
      <button className="w-full rounded-full bg-[#ef6b3b] px-4 py-3.5 font-bold text-white transition hover:bg-[#c94924]">{mode === 'forgot' ? resetStep === 'email' ? 'Enviar código' : resetStep === 'otp' ? 'Validar código' : 'Salvar nova senha' : mode === 'signup' ? 'Criar conta' : 'Entrar ↗'}</button>
    </form>
    <div className="mt-6 text-center text-sm text-[#66675d]">{mode === 'login' && <><button onClick={() => changeMode('forgot')} className="text-[#c94924] hover:underline">Esqueci minha senha</button><p className="mt-3">Ainda não tem conta? <button onClick={() => changeMode('signup')} className="font-bold text-[#c94924]">Cadastre-se</button></p></>}{mode === 'signup' && <p>Já tem uma conta? <button onClick={() => changeMode('login')} className="font-bold text-[#c94924]">Entrar</button></p>}{mode === 'forgot' && <div className="space-y-3"><button onClick={() => changeMode('login')} className="font-bold text-[#c94924]">Voltar para o login</button>{resetStep === 'otp' && <><button type="button" onClick={() => { requestPasswordReset(email); setOtp(''); setError(''); setMessage('Se o endereço for válido, um novo código será enviado.'); }} className="block w-full text-[#777568] hover:text-[#242622]">Reenviar código</button><button type="button" onClick={() => { setResetStep('email'); setOtp(''); setError(''); setMessage(''); }} className="block w-full text-[#777568] hover:text-[#242622]">Usar outro e-mail</button></>}</div>}</div>
  </section></main>;
}
