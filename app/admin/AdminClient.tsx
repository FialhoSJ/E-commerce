'use client';

import { FormEvent, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { ProductType } from '@/lib/types/ProductType';

type ProductForm = { title: string; category: string; price: string; image: string; description: string; stock: string };
const emptyForm: ProductForm = { title: '', category: 'Decoração', price: '', image: 'https://placehold.co/600x600/e2e8f0/0f172a?text=Produto', description: '', stock: '0' };

export default function AdminClient({ initialProducts, databaseReady }: { initialProducts: ProductType[]; databaseReady: boolean }) {
  const [catalogProducts, setCatalogProducts] = useState(initialProducts);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const setField = (field: keyof ProductForm, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const edit = (product: ProductType) => { setEditingId(product.id); setForm({ title: product.title, category: product.category, price: String(product.price ?? ''), image: product.image, description: product.description || '', stock: String(product.stock ?? 0) }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const reset = () => { setEditingId(null); setForm(emptyForm); };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || !databaseReady) return;
    setError('');
    const product = { title: form.title.trim(), category: form.category.trim(), price: Number(form.price), image: form.image.trim(), description: form.description.trim(), stock: Number(form.stock) };
    if (!product.title || !product.category || !product.image || !Number.isFinite(product.price) || product.price < 0 || !Number.isSafeInteger(product.stock) || product.stock < 0) { setError('Preencha os campos com valores válidos.'); return; }
    setBusy(true);
    try {
      const response = await fetch(editingId === null ? '/api/admin/products' : `/api/admin/products/${editingId}`, { method: editingId === null ? 'POST' : 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(product) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível salvar o produto.');
      const saved = data.product as ProductType;
      setCatalogProducts((current) => editingId === null ? [...current, saved] : current.map((item) => item.id === saved.id ? saved : item));
      toast.success(editingId === null ? 'Produto criado no catálogo.' : 'Produto atualizado.');
      reset();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível salvar o produto.'); }
    finally { setBusy(false); }
  };
  const remove = async (product: ProductType) => {
    if (busy || !databaseReady || !window.confirm(`Excluir ${product.title}?`)) return;
    setBusy(true); setError('');
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' });
      if (!response.ok) { const data = await response.json(); throw new Error(data.error || 'Não foi possível excluir o produto.'); }
      setCatalogProducts((current) => current.filter((item) => item.id !== product.id));
      if (editingId === product.id) reset();
      toast.success('Produto excluído do catálogo.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível excluir o produto.'); }
    finally { setBusy(false); }
  };

  return <main className="min-h-screen bg-[#f8faf9] px-6 py-10 text-slate-950 lg:px-10"><div className="mx-auto max-w-7xl">
    <div className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-8 sm:flex-row sm:items-end"><div><p className="text-sm font-bold uppercase tracking-[0.22em] text-teal-700">Área restrita</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">Painel administrativo</h1><p className="mt-3 max-w-xl text-slate-500">Gerencie os produtos exibidos na loja.</p></div><div className="rounded-2xl bg-white px-5 py-3 text-sm shadow-sm"><strong>{catalogProducts.length}</strong> produtos no catálogo</div></div>
    {!databaseReady && <p role="alert" className="mt-6 rounded-xl bg-amber-50 p-4 text-amber-900">Catálogo indisponível. Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no servidor e execute a migração do banco.</p>}
    {error && <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
    <div className="mt-8 grid gap-8 lg:grid-cols-[.75fr_1.25fr]">
      <form onSubmit={submit} className="h-fit rounded-3xl bg-white p-6 shadow-sm"><fieldset disabled={!databaseReady || busy} className="disabled:opacity-60"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">{editingId === null ? 'Adicionar produto' : 'Editar produto'}</h2>{editingId !== null && <button type="button" onClick={reset} className="text-sm font-semibold text-slate-500">Cancelar</button>}</div><div className="mt-5 space-y-4"><label className="block text-sm font-semibold">Nome<input required maxLength={160} value={form.title} onChange={(event) => setField('title', event.target.value)} className="auth-input" placeholder="Ex.: Suporte de fone" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold">Categoria<input required maxLength={80} value={form.category} onChange={(event) => setField('category', event.target.value)} className="auth-input" /></label><label className="block text-sm font-semibold">Preço<input required min="0" step="0.01" type="number" value={form.price} onChange={(event) => setField('price', event.target.value)} className="auth-input" placeholder="0,00" /></label></div><label className="block text-sm font-semibold">Estoque<input required min="0" step="1" type="number" value={form.stock} onChange={(event) => setField('stock', event.target.value)} className="auth-input" /></label><label className="block text-sm font-semibold">URL da imagem<input required type="url" value={form.image} onChange={(event) => setField('image', event.target.value)} className="auth-input" /></label><label className="block text-sm font-semibold">Descrição<textarea required maxLength={5000} value={form.description} onChange={(event) => setField('description', event.target.value)} className="auth-input min-h-28" /></label><button className="w-full rounded-xl bg-slate-950 px-4 py-3 font-bold text-white hover:bg-teal-700">{busy ? 'Salvando...' : editingId === null ? 'Adicionar produto' : 'Salvar alterações'}</button></div></fieldset></form>
      <section><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">Catálogo atual</h2><span className="text-sm text-slate-500">Edite ou remova qualquer item</span></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{catalogProducts.map((product) => <article key={product.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"><div className="relative h-40 rounded-2xl bg-slate-50"><Image src={product.image} alt="" fill sizes="240px" unoptimized className="object-contain p-5" /></div><h3 className="mt-4 line-clamp-2 font-semibold">{product.title}</h3><p className="mt-1 text-sm text-teal-700">{product.price?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p><p className="mt-1 text-xs text-slate-500">{product.category} · estoque {product.stock ?? '—'}</p><div className="mt-4 grid grid-cols-2 gap-2"><button type="button" disabled={busy || !databaseReady} onClick={() => edit(product)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold hover:border-teal-600 hover:text-teal-700 disabled:opacity-50">Editar</button><button type="button" disabled={busy || !databaseReady} onClick={() => remove(product)} className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">Excluir</button></div></article>)}</div></section>
    </div>
  </div></main>;
}
