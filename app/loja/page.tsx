import Link from 'next/link';
import { ProductType } from '@/lib/types/ProductType';
import Product from '../components/Product';

async function getProducts(): Promise<ProductType[]> {
  const response = await fetch('https://fakestoreapi.com/products', { next: { revalidate: 3600 } });
  if (!response.ok) throw new Error('Não foi possível carregar os produtos.');
  return response.json();
}

export default async function ShopPage() {
  const products = await getProducts();
  return <div className="bg-[#f8faf9] text-slate-950"><section className="mx-auto max-w-7xl px-6 pb-12 pt-14 lg:px-10"><Link href="/" className="text-sm font-semibold text-teal-700">← Voltar para a apresentação</Link><div className="mt-12 flex flex-col justify-between gap-5 border-b border-slate-200 pb-8 sm:flex-row sm:items-end"><div><p className="text-sm font-bold uppercase tracking-[0.22em] text-teal-700">Loja online</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">Produtos para fazer parte.</h1><p className="mt-3 max-w-lg text-slate-500">Uma seleção essencial para trazer mais personalidade aos seus espaços.</p></div><span className="text-sm text-slate-500">{products.length} produtos</span></div><div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <Product key={product.id} product={product} />)}</div></section></div>;
}
