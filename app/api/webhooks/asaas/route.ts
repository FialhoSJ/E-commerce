import { timingSafeEqual } from 'node:crypto';
import { supabaseRequest } from '@/lib/server/supabase';

type AsaasWebhookEvent = {
  event?: string;
  payment?: {
    id?: string;
    externalReference?: string;
    value?: number;
  };
};

type PendingOrder = { id: string; status: string; total_cents: number };

function matchesToken(received: string | null, expected: string) {
  if (!received) return false;
  const actualBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export async function POST(request: Request) {
  const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;
  if (!expectedToken || !matchesToken(request.headers.get('asaas-access-token'), expectedToken)) {
    return Response.json({ error: 'Acesso negado.' }, { status: 401 });
  }

  let event: AsaasWebhookEvent;
  try { event = await request.json() as AsaasWebhookEvent; }
  catch { return Response.json({ error: 'Evento inválido.' }, { status: 400 }); }

  if (!['PAYMENT_CONFIRMED', 'PAYMENT_RECEIVED'].includes(event.event || '')) return Response.json({ ok: true });
  const paymentId = event.payment?.id || '';
  const orderId = event.payment?.externalReference || '';
  if (!paymentId) return Response.json({ error: 'Referência de pagamento inválida.' }, { status: 400 });

  try {
    const query = new URLSearchParams({
      select: 'id,status,total_cents',
      payment_provider: 'eq.asaas',
      payment_reference: `eq.${paymentId}`,
      limit: '1',
    });
    const [order] = await supabaseRequest<PendingOrder[]>(`orders?${query}`);
    if (!order) return Response.json({ ok: true });
    if (orderId && orderId !== order.id) return Response.json({ error: 'Referência de pedido não corresponde à cobrança.' }, { status: 400 });
    if (typeof event.payment?.value === 'number' && Math.round(event.payment.value * 100) !== order.total_cents) {
      console.error('Asaas payment amount does not match order', order.id);
      return Response.json({ error: 'Valor do pagamento não corresponde ao pedido.' }, { status: 400 });
    }
    if (order.status !== 'pending_payment') return Response.json({ ok: true });

    await supabaseRequest(`orders?id=eq.${encodeURIComponent(order.id)}&status=eq.pending_payment&payment_provider=eq.asaas&payment_reference=eq.${encodeURIComponent(paymentId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'paid', updated_at: new Date().toISOString() }),
    });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: 'Não foi possível atualizar o pedido.' }, { status: 500 });
  }
}
