import { createHmac, timingSafeEqual } from 'node:crypto';
import { supabaseRequest } from '@/lib/server/supabase';

// Public verification key documented by AbacatePay for X-Webhook-Signature.
const ABACATEPAY_PUBLIC_KEY = 't9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHFs0WIIywSMg0q7RmBfybe1E5XJcfC4IW3alNqym0tXoAKkzvfEjZxV6bE0oG2zJrNNYmUCKZyV0KZ3JS8Votf9EAWWYdiDkMkpbMdPggfh1EqHlVkMiTady6jOR3hyzGEHrIz2Ret0xHKMbiqkr9HS1JhNHDX9';

type WebhookEvent = {
  event?: string;
  data?: { externalId?: string; metadata?: { orderId?: string } };
};

function hasValidSignature(rawBody: string, signature: string) {
  const expected = createHmac('sha256', ABACATEPAY_PUBLIC_KEY).update(rawBody, 'utf8').digest();
  let provided: Buffer;
  try { provided = Buffer.from(signature, 'base64'); } catch { return false; }
  if (provided.toString('base64') !== signature) return false;
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

function matchesSecret(received: string | null, expected: string) {
  if (!received) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const webhookSecret = process.env.ABACATEPAY_WEBHOOK_SECRET;
  const receivedSecret = new URL(request.url).searchParams.get('webhookSecret');
  if (!webhookSecret || !matchesSecret(receivedSecret, webhookSecret)) return Response.json({ error: 'Acesso negado.' }, { status: 401 });

  const rawBody = await request.text();
  const signature = request.headers.get('x-webhook-signature') || '';
  if (!hasValidSignature(rawBody, signature)) return Response.json({ error: 'Assinatura inválida.' }, { status: 401 });

  let event: WebhookEvent;
  try { event = JSON.parse(rawBody) as WebhookEvent; }
  catch { return Response.json({ error: 'Evento inválido.' }, { status: 400 }); }

  if (event.event !== 'checkout.completed') return Response.json({ ok: true });
  const data = event.data as (WebhookEvent['data'] & { checkout?: WebhookEvent['data']; bill?: WebhookEvent['data'] }) | undefined;
  const orderId = data?.externalId || data?.metadata?.orderId || data?.checkout?.externalId || data?.checkout?.metadata?.orderId || data?.bill?.externalId || data?.bill?.metadata?.orderId;
  if (!orderId || !/^[0-9a-f-]{36}$/i.test(orderId)) return Response.json({ error: 'Referência de pedido inválida.' }, { status: 400 });

  try {
    await supabaseRequest(`orders?id=eq.${encodeURIComponent(orderId)}&status=eq.pending_payment`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'paid', updated_at: new Date().toISOString() }),
    });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: 'Não foi possível atualizar o pedido.' }, { status: 500 });
  }
}
