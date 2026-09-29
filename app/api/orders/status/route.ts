import { hasSupabaseConfig, supabaseRequest } from '@/lib/server/supabase';
import { createClient as createAuthClient } from '@/lib/supabase/server';

type OrderStatusRow = { id: string; status: string; total_cents: number };

export async function GET(request: Request) {
  if (!hasSupabaseConfig()) return Response.json({ error: 'Pedidos persistentes não estão configurados.' }, { status: 503 });
  let userId: string;
  try {
    const authClient = await createAuthClient();
    const { data: { user }, error } = await authClient.auth.getUser();
    if (error || !user) return Response.json({ error: 'Entre na sua conta para consultar este pedido.' }, { status: 401 });
    userId = user.id;
  } catch {
    return Response.json({ error: 'A autenticação não está configurada no servidor.' }, { status: 503 });
  }
  const orderId = new URL(request.url).searchParams.get('orderId') || '';
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) return Response.json({ error: 'Pedido inválido.' }, { status: 400 });

  try {
    const rows = await supabaseRequest<OrderStatusRow[]>(`orders?select=id,status,total_cents&id=eq.${encodeURIComponent(orderId)}&user_id=eq.${encodeURIComponent(userId)}&limit=1`);
    if (!rows[0]) return Response.json({ error: 'Pedido não encontrado.' }, { status: 404 });
    return Response.json({ order: { id: rows[0].id, status: rows[0].status, total: rows[0].total_cents / 100 } });
  } catch {
    return Response.json({ error: 'Não foi possível consultar o pedido.' }, { status: 500 });
  }
}
