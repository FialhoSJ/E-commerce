import { getCatalogProducts } from '@/lib/server/catalog';
import ShopClient from './ShopClient';

export default async function ShopPage() {
  const products = await getCatalogProducts();
  return <ShopClient initialProducts={products} />;
}
