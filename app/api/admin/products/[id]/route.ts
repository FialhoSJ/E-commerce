import { getAdminSession } from '@/lib/server/admin-auth';
import { mapProductRow, parseProductInput, productFields, productToRow } from '@/lib/server/catalog';
import { hasSupabaseConfig, supabaseRequest } from '@/lib/server/supabase';

function parseId(value: string): number | null {
  const id = Number(value);
  return /^\d+$/.test(value) && Number.isSafeInteger(id) && id > 0 ? id : null;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await getAdminSession()) return Response.json({ error: 'Acesso negado.' }, { status: 401 });
  if (!hasSupabaseConfig()) return Response.json({ error: 'Configure o Supabase no servidor.' }, { status: 503 });
  const id = parseId((await params).id);
  const product = parseProductInput(await request.json().catch(() => null));
  if (!id || !product) return Response.json({ error: 'Dados do produto inválidos.' }, { status: 400 });
  try {
    const rows = await supabaseRequest<Array<Parameters<typeof mapProductRow>[0]>>(
      `products?store_id=eq.${id}&select=${productFields}`,
      { method: 'PATCH', body: JSON.stringify(productToRow(product)) },
    );
    if (!rows[0]) return Response.json({ error: 'Produto não encontrado.' }, { status: 404 });
    return Response.json({ product: mapProductRow(rows[0]) });
  } catch {
    return Response.json({ error: 'Não foi possível atualizar o produto.' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await getAdminSession()) return Response.json({ error: 'Acesso negado.' }, { status: 401 });
  if (!hasSupabaseConfig()) return Response.json({ error: 'Configure o Supabase no servidor.' }, { status: 503 });
  const id = parseId((await params).id);
  if (!id) return Response.json({ error: 'ID inválido.' }, { status: 400 });
  try {
    const rows = await supabaseRequest<Array<{ store_id: number }>>(`products?store_id=eq.${id}&select=store_id`, { method: 'DELETE' });
    if (!rows[0]) return Response.json({ error: 'Produto não encontrado.' }, { status: 404 });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: 'Não foi possível excluir o produto.' }, { status: 500 });
  }
}
