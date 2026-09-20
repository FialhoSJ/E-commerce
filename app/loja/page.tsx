import { ProductType } from '@/lib/types/ProductType';
import ShopClient from './ShopClient';

async function getProducts(): Promise<ProductType[]> {
  const response = await fetch('https://fakestoreapi.com/products', { next: { revalidate: 3600 } });
  if (!response.ok) throw new Error('Não foi possível carregar os produtos.');
  return response.json();
}

export default async function ShopPage() {
  const products = await getProducts();
  return <ShopClient initialProducts={products} />;
}
