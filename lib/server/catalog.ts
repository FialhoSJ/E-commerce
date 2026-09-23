import type { ProductType } from '@/lib/types/ProductType';
import { hasSupabaseConfig, supabaseRequest } from './supabase';

type ProductRow = {
  store_id: number;
  title: string;
  description: string | null;
  price_cents: number;
  image_url: string | null;
  category_label: string;
  stock: number;
  active: boolean;
};

const fields = 'store_id,title,description,price_cents,image_url,category_label,stock,active';

function mapProduct(row: ProductRow): ProductType {
  return {
    id: row.store_id,
    title: row.title,
    description: row.description,
    price: row.price_cents / 100,
    image: row.image_url || '/file.svg',
    category: row.category_label,
    stock: row.stock,
  };
}

export async function getCatalogProducts(includeInactive = false): Promise<ProductType[]> {
  if (!hasSupabaseConfig()) return [];
  const rows = await supabaseRequest<ProductRow[]>(`products?select=${fields}${includeInactive ? '' : '&active=eq.true'}&order=store_id.asc`);
  return rows.map(mapProduct);
}

export async function getCatalogProduct(id: number): Promise<ProductType | null> {
  if (!hasSupabaseConfig() || !Number.isSafeInteger(id) || id < 1) return null;
  const rows = await supabaseRequest<ProductRow[]>(`products?select=${fields}&store_id=eq.${id}&active=eq.true&limit=1`);
  return rows[0] ? mapProduct(rows[0]) : null;
}

export function parseProductInput(value: unknown): Omit<ProductType, 'id'> | null {
  if (!value || typeof value !== 'object') return null;
  const input = value as Record<string, unknown>;
  const title = typeof input.title === 'string' ? input.title.trim() : '';
  const category = typeof input.category === 'string' ? input.category.trim() : '';
  const description = typeof input.description === 'string' ? input.description.trim() : '';
  const image = typeof input.image === 'string' ? input.image.trim() : '';
  const price = input.price;
  const stock = input.stock;
  let url: URL;
  try { url = new URL(image); } catch { return null; }
  if (url.protocol !== 'https:' || !title || title.length > 160 || !category || category.length > 80 || description.length > 5000 ||
    typeof price !== 'number' || !Number.isFinite(price) || price < 0 || !Number.isSafeInteger(Math.round(price * 100)) ||
    typeof stock !== 'number' || !Number.isSafeInteger(stock) || stock < 0) return null;
  return { title, category, description, image, price, stock };
}

export function productToRow(product: Omit<ProductType, 'id'>) {
  return {
    title: product.title,
    category_label: product.category,
    description: product.description,
    image_url: product.image,
    price_cents: Math.round((product.price || 0) * 100),
    stock: product.stock,
    updated_at: new Date().toISOString(),
  };
}

export { fields as productFields, mapProduct as mapProductRow };
