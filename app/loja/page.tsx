import { getCatalogProducts } from '@/lib/server/catalog';
import ShopClient from './ShopClient';

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ busca?: string | string[] }>;
}) {
  const products = await getCatalogProducts();
  const params = await searchParams;
  const initialSearch = typeof params.busca === 'string' ? params.busca : '';
  return <ShopClient initialProducts={products} initialSearch={initialSearch} />;
}
