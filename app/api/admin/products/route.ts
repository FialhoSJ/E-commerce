import { randomUUID } from 'node:crypto';
import { getAdminSession } from '@/lib/server/admin-auth';
import { getCatalogProducts, mapProductRow, parseProductInput, productFields, productToRow } from '@/lib/server/catalog';
import { hasSupabaseConfig, supabaseRequest } from '@/lib/server/supabase';

export async function GET() {
  if (!await getAdminSession()) return Response.json({ error: 'Acesso negado.' }, { status: 401 });
  if (!hasSupabaseConfig()) return Response.json({ error: 'Configure o Supabase no servidor.' }, { status: 503 });
  try { return Response.json({ products: await getCatalogProducts(true) }); }
  catch { return Response.json({ error: 'Não foi possível carregar os produtos.' }, { status: 500 }); }
}

export async function POST(request: Request) {
  if (!await getAdminSession()) return Response.json({ error: 'Acesso negado.' }, { status: 401 });
  if (!hasSupabaseConfig()) return Response.json({ error: 'Configure o Supabase no servidor.' }, { status: 503 });
  const product = parseProductInput(await request.json().catch(() => null));
  if (!product) return Response.json({ error: 'Dados inválidos. Confira nome, categoria, URL HTTPS da imagem, preço e estoque inteiro (zero ou maior).' }, { status: 400 });
  try {
    const rows = await supabaseRequest<Array<Parameters<typeof mapProductRow>[0]>>(
      `products?select=${productFields}`,
      {
        method: 'POST',
        body: JSON.stringify({ ...productToRow(product), slug: randomUUID(), active: true }),
      },
    );
    if (!rows[0]) throw new Error('Produto não criado.');
    return Response.json({ product: mapProductRow(rows[0]) }, { status: 201 });
  } catch {
    return Response.json({ error: 'Não foi possível criar o produto. Confira a migração do banco.' }, { status: 500 });
  }
}
