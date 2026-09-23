import type { ProductType } from '@/lib/types/ProductType';

type FakeStoreProduct = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
};

const FAKE_STORE_URL = 'https://fakestoreapi.com/products';

export async function getFakeStoreProducts(): Promise<ProductType[]> {
  try {
    const response = await fetch(FAKE_STORE_URL, { next: { revalidate: 300 } });
    if (!response.ok) return [];
    const products = await response.json() as FakeStoreProduct[];
    return products
      .filter((product) => Number.isFinite(product.id) && typeof product.title === 'string' && typeof product.image === 'string')
      .map((product) => ({
        id: product.id,
        title: product.title,
        price: Number.isFinite(product.price) ? product.price : 0,
        description: product.description || '',
        category: product.category || 'Importados',
        image: product.image,
        stock: 10,
      }));
  } catch {
    return [];
  }
}
