'use client';

import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import type { ProductType } from '@/lib/types/ProductType';

type ProductForm = {
  title: string;
  category: string;
  price: string;
  image: string;
  description: string;
  stock: string;
};

type AdminView = 'catalog' | 'fake';
type ImageMode = 'upload' | 'url';

const emptyForm: ProductForm = {
  title: '',
  category: 'Decoração',
  price: '',
  image: '',
  description: '',
  stock: '0',
};

const money = (value: number | null) => value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'Sem preço';

export default function AdminDashboard({
  initialProducts,
  fakeProducts,
  databaseReady,
}: {
  initialProducts: ProductType[];
  fakeProducts: ProductType[];
  databaseReady: boolean;
}) {
  const [catalogProducts, setCatalogProducts] = useState(initialProducts);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [activeView, setActiveView] = useState<AdminView>('catalog');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageMode, setImageMode] = useState<ImageMode>('upload');
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const setField = (field: keyof ProductForm, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const reset = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImageMode('upload');
    setImagePreview('');
  };

  const edit = (product: ProductType) => {
    setEditingId(product.id);
    setImageMode('url');
    setForm({
      title: product.title,
      category: product.category,
      price: String(product.price ?? ''),
      image: product.image,
      description: product.description || '',
      stock: String(product.stock ?? 0),
    });
    setImagePreview(product.image);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const catalogResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return catalogProducts;
    return catalogProducts.filter((product) => `${product.title} ${product.category}`.toLowerCase().includes(query));
  }, [catalogProducts, search]);

  const fakeResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return fakeProducts;
    return fakeProducts.filter((product) => `${product.title} ${product.category}`.toLowerCase().includes(query));
  }, [fakeProducts, search]);

  const loadFakeProduct = (product: ProductType) => {
    setEditingId(null);
    setImageMode('url');
    setForm({
      title: product.title,
      category: product.category,
      price: String(product.price ?? ''),
      image: product.image,
      description: product.description || '',
      stock: String(product.stock ?? 10),
    });
    setImagePreview(product.image);
    setActiveView('catalog');
    setNotice('Produto carregado no formulário. Revise o preço e salve no catálogo.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError('');
    setNotice('');
    setField('image', '');
    setImagePreview(URL.createObjectURL(file));
    setUploadingImage(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const response = await fetch('/api/admin/products/image', { method: 'POST', body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível enviar a imagem.');
      setField('image', data.url);
      setImagePreview(data.url);
      toast.success('Imagem enviada para o catálogo.');
    } catch (cause) {
      setImagePreview('');
      setError(cause instanceof Error ? cause.message : 'Não foi possível enviar a imagem.');
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || !databaseReady) return;
    setError('');
    setNotice('');
    const product = {
      title: form.title.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      image: form.image.trim(),
      description: form.description.trim(),
      stock: Number(form.stock),
    };
    if (!product.image) {
      setError(imageMode === 'upload' ? 'Envie uma imagem do produto.' : 'Informe a URL da imagem.');
      return;
    }
    if (!product.title || !product.category || !Number.isFinite(product.price) || product.price < 0 || !Number.isSafeInteger(product.stock) || product.stock < 0) {
      setError('Preencha os campos com valores válidos.');
      return;
    }
    setBusy(true);
    try {
      const isEditing = editingId !== null;
      const response = await fetch(isEditing ? `/api/admin/products/${editingId}` : '/api/admin/products', {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível salvar o produto.');
      const saved = data.product as ProductType;
      setCatalogProducts((current) => isEditing ? current.map((item) => item.id === saved.id ? saved : item) : [...current, saved]);
      toast.success(isEditing ? 'Produto atualizado.' : 'Produto adicionado ao catálogo.');
      reset();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível salvar o produto.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (product: ProductType) => {
    if (busy || !databaseReady || !window.confirm(`Excluir ${product.title}?`)) return;
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível excluir o produto.');
      setCatalogProducts((current) => current.filter((item) => item.id !== product.id));
      if (editingId === product.id) reset();
      toast.success('Produto excluído do catálogo.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível excluir o produto.');
    } finally {
      setBusy(false);
    }
  };

  const productCard = (product: ProductType, fake = false) => (
    <article key={`${fake ? 'fake' : 'catalog'}-${product.id}`} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-48 bg-slate-100">
        <Image src={product.image} alt={product.title} fill sizes="(max-width: 768px) 100vw, 320px" unoptimized className="object-contain p-6 transition duration-500 group-hover:scale-105" />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-600 shadow-sm">{product.category}</span>
      </div>
      <div className="p-5">
        <h3 className="min-h-12 font-semibold leading-6 text-slate-950">{product.title}</h3>
        <div className="mt-3 flex items-center justify-between gap-3">
          <strong className="text-lg text-teal-700">{fake ? `US$ ${product.price?.toFixed(2)}` : money(product.price)}</strong>
          <span className="text-xs text-slate-500">{fake ? 'referência' : `estoque ${product.stock ?? 0}`}</span>
        </div>
        <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">{product.description || 'Sem descrição cadastrada.'}</p>
        {fake ? (
          <button type="button" onClick={() => loadFakeProduct(product)} disabled={!databaseReady} className="mt-5 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50">Usar no cadastro</button>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button type="button" disabled={busy || !databaseReady} onClick={() => edit(product)} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-teal-600 hover:text-teal-700 disabled:opacity-50">Editar</button>
            <button type="button" disabled={busy || !databaseReady} onClick={() => remove(product)} className="rounded-xl border border-red-200 px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50">Excluir</button>
          </div>
        )}
      </div>
    </article>
  );

  return (
    <main className="min-h-screen bg-[#f6f8f7] px-4 py-6 text-slate-950 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-8 text-white shadow-xl sm:px-10">
          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div>
              <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.24em] text-teal-300"><span className="grid h-8 w-8 place-items-center rounded-xl bg-teal-400 text-slate-950">3D</span> Área administrativa</div>
              <h1 className="mt-5 max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">Organize sua vitrine com clareza.</h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">Gerencie produtos publicados e use a Fake Store API como referência visual para novos itens.</p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-200"><span className={`h-2.5 w-2.5 rounded-full ${databaseReady ? 'bg-emerald-400' : 'bg-amber-400'}`} /> {databaseReady ? 'Supabase conectado' : 'Supabase pendente'}</div>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-4"><p className="text-xs uppercase tracking-wider text-slate-400">Publicados</p><strong className="mt-2 block text-2xl">{catalogProducts.length}</strong></div>
            <div className="rounded-2xl bg-white/10 p-4"><p className="text-xs uppercase tracking-wider text-slate-400">Referências fake</p><strong className="mt-2 block text-2xl">{fakeProducts.length}</strong></div>
            <div className="rounded-2xl bg-white/10 p-4"><p className="text-xs uppercase tracking-wider text-slate-400">Acesso</p><strong className="mt-2 block text-2xl">Administrador</strong></div>
          </div>
        </header>

        {!databaseReady && <p role="alert" className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">A visualização da API fake está disponível, mas salve produtos somente depois de configurar o Supabase no servidor.</p>}
        {error && <p role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">{error}</p>}
        {notice && <p role="status" className="mt-6 rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm leading-6 text-teal-800">{notice}</p>}

        <section className="mt-8 grid gap-8 lg:grid-cols-[360px_1fr]">
          <form onSubmit={submit} className="h-fit rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">{editingId === null ? 'Novo item' : 'Edição'}</p><h2 className="mt-2 text-2xl font-bold">{editingId === null ? 'Adicionar produto' : 'Editar produto'}</h2></div>{editingId !== null && <button type="button" onClick={reset} className="text-sm font-semibold text-slate-500 hover:text-slate-950">Cancelar</button>}</div>
            <fieldset disabled={!databaseReady || busy || uploadingImage} className="mt-6 space-y-4 disabled:opacity-60">
              <label className="block text-sm font-semibold">Nome<input required maxLength={160} value={form.title} onChange={(event) => setField('title', event.target.value)} className="auth-input" placeholder="Ex.: Suporte de fone" /></label>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"><label className="block text-sm font-semibold">Categoria<input required maxLength={80} value={form.category} onChange={(event) => setField('category', event.target.value)} className="auth-input" /></label><label className="block text-sm font-semibold">Preço<input required min="0" step="0.01" type="number" value={form.price} onChange={(event) => setField('price', event.target.value)} className="auth-input" placeholder="0,00" /></label></div>
              <label className="block text-sm font-semibold">Estoque<input required min="0" step="1" type="number" value={form.stock} onChange={(event) => setField('stock', event.target.value)} className="auth-input" /></label>
              <div className="space-y-3">
                <p className="text-sm font-semibold">Imagem do produto</p>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" aria-pressed={imageMode === 'upload'} onClick={() => { setImageMode('upload'); setField('image', ''); setImagePreview(''); }} className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${imageMode === 'upload' ? 'border-teal-600 bg-teal-50 text-teal-800' : 'border-slate-200 text-slate-600 hover:border-slate-400'}`}>
                    Enviar arquivo
                  </button>
                  <button type="button" aria-pressed={imageMode === 'url'} onClick={() => { setImageMode('url'); setField('image', ''); setImagePreview(''); }} className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${imageMode === 'url' ? 'border-teal-600 bg-teal-50 text-teal-800' : 'border-slate-200 text-slate-600 hover:border-slate-400'}`}>
                    Usar URL
                  </button>
                </div>
                {imageMode === 'upload' && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-600">
                      Escolha uma imagem
                      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadImage} className="mt-2 block w-full cursor-pointer rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-950 file:px-3 file:py-2 file:font-semibold file:text-white hover:border-teal-500" />
                      <span className="mt-2 block text-xs font-normal text-slate-500">JPG, PNG ou WEBP · até 5 MB</span>
                    </label>
                    {imagePreview && <div className="relative h-36 overflow-hidden rounded-2xl bg-slate-100"><Image src={imagePreview} alt="Prévia da imagem do produto" fill unoptimized className="object-contain p-4" /></div>}
                  </div>
                )}
                {imageMode === 'url' && (
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold">
                      URL da imagem
                      <input required type="url" value={form.image} onChange={(event) => setField('image', event.target.value)} className="auth-input" placeholder="https://..." />
                    </label>
                    {form.image && <div className="relative h-36 overflow-hidden rounded-2xl bg-slate-100"><Image src={form.image} alt="Prévia da imagem do produto" fill unoptimized className="object-contain p-4" /></div>}
                  </div>
                )}
                {uploadingImage && <p className="text-xs font-semibold text-teal-700">Enviando imagem...</p>}
              </div>
              <label className="block text-sm font-semibold">Descrição<textarea required maxLength={5000} value={form.description} onChange={(event) => setField('description', event.target.value)} className="auth-input min-h-28" /></label>
              <button className="w-full rounded-xl bg-teal-600 px-4 py-3 font-bold text-white transition hover:bg-teal-500">{busy ? 'Salvando...' : editingId === null ? 'Salvar produto' : 'Salvar alterações'}</button>
            </fieldset>
          </form>

          <section className="min-w-0">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Biblioteca de produtos</p><h2 className="mt-2 text-3xl font-bold">Escolha o que exibir</h2></div><div className="relative w-full sm:max-w-xs"><span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-teal-600" placeholder="Buscar produto..." /></div></div>
            <div className="mt-6 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"><button type="button" onClick={() => setActiveView('catalog')} className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${activeView === 'catalog' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Meu catálogo <span className="ml-1 opacity-60">{catalogProducts.length}</span></button><button type="button" onClick={() => setActiveView('fake')} className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${activeView === 'fake' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>API fake <span className="ml-1 opacity-60">{fakeProducts.length}</span></button></div>
            {activeView === 'fake' && <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900">Estes produtos vêm da Fake Store API e servem como referência visual. Clique em <strong>Usar no cadastro</strong>, revise os dados e salve no seu catálogo.</div>}
            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{(activeView === 'catalog' ? catalogResults : fakeResults).map((product) => productCard(product, activeView === 'fake'))}</div>
            {(activeView === 'catalog' ? catalogResults : fakeResults).length === 0 && <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center"><p className="text-3xl">⌁</p><h3 className="mt-3 font-bold">Nenhum produto encontrado</h3><p className="mt-2 text-sm text-slate-500">Tente outro termo de busca ou alterne a biblioteca.</p></div>}
          </section>
        </section>
      </div>
    </main>
  );
}
