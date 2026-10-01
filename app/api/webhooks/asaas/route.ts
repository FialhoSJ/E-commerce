import { timingSafeEqual } from 'node:crypto';
import { supabaseRequest } from '@/lib/server/supabase';

type AsaasWebhookEvent = {
  event?: string;
  checkout?: {
    id?: string;
    externalReference?: string;
  };
};

type PendingOrder = { id: string; payment_reference: string | null };

function hasValidToken(received: string | null, expected: string) {
  if (!received) return false;
  const receivedBytes = Buffer.from(received);
  const expectedBytes = Buffer.from(expected);
  return receivedBytes.length === expectedBytes.length && timingSafeEqual(receivedBytes, expectedBytes);
}

export async function POST(request: Request) {
  const webhookToken = process.env.ASAAS_WEBHOOK_TOKEN;
  if (!webhookToken || webhookToken.length < 32 || webhookToken.length > 255) {
    return Response.json({ error: 'Configure ASAAS_WEBHOOK_TOKEN com 32 a 255 caracteres.' }, { status: 503 });
  }
  if (!hasValidToken(request.headers.get('asaas-access-token'), webhookToken)) {
    return Response.json({ error: 'Acesso negado.' }, { status: 401 });
  }

  let event: AsaasWebhookEvent;
  try {
    event = await request.json() as AsaasWebhookEvent;
  } catch {
    return Response.json({ error: 'Evento inválido.' }, { status: 400 });
  }

  if (event.event !== 'CHECKOUT_PAID') return Response.json({ ok: true });

  const orderId = event.checkout?.externalReference;
  const checkoutId = event.checkout?.id;
  if (!orderId || !/^[0-9a-f-]{36}$/i.test(orderId) || !checkoutId) {
    return Response.json({ error: 'Referência do checkout inválida.' }, { status: 400 });
  }

  try {
    const matchingOrders = await supabaseRequest<PendingOrder[]>(
      `orders?select=id,payment_reference&id=eq.${encodeURIComponent(orderId)}&payment_provider=eq.asaas&status=eq.pending_payment&limit=1`,
    );
    const order = matchingOrders[0];
    if (!order || (order.payment_reference && order.payment_reference !== checkoutId)) return Response.json({ ok: true });

    await supabaseRequest(`orders?id=eq.${encodeURIComponent(orderId)}&payment_provider=eq.asaas&status=eq.pending_payment`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'paid', updated_at: new Date().toISOString() }),
    });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: 'Não foi possível atualizar o pedido.' }, { status: 500 });
  }
}
