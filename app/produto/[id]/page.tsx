import { notFound } from 'next/navigation';
import { ProductType } from '@/lib/types/ProductType';
import ProductDetails from './ProductDetails';

async function getProduct(id: string): Promise<ProductType | null> {
  const response = await fetch(`https://fakestoreapi.com/products/${id}`, { next: { revalidate: 3600 } });
  if (!response.ok) return null;
  return response.json();
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();
  return <ProductDetails product={product} />;
}
