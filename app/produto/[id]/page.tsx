import { notFound } from 'next/navigation';
import { getCatalogProduct } from '@/lib/server/catalog';
import ProductDetails from './ProductDetails';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getCatalogProduct(Number(id));
  if (!product) notFound();
  return <ProductDetails product={product} />;
}
