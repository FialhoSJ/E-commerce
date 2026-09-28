const API_URL = 'https://api.abacatepay.com/v2';

type ApiEnvelope<T> = { data?: T; success?: boolean; error?: string | null };

async function request<T>(path: string, body: unknown): Promise<T> {
  const apiKey = process.env.ABACATEPAY_API_KEY;
  if (!apiKey) throw new Error('AbacatePay não está configurado no servidor.');

  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
    signal: AbortSignal.timeout(20_000),
  });
  const result = await response.json().catch(() => null) as ApiEnvelope<T> | null;
  if (!response.ok || !result?.success || !result.data) {
    throw new Error(typeof result?.error === 'string' ? result.error : `AbacatePay respondeu ${response.status}.`);
  }
  return result.data;
}

export async function createHostedCheckout(input: {
  orderId: string;
  totalCents: number;
  itemCount: number;
  origin: string;
}) {
  const product = await request<{ id: string }>('/products/create', {
    externalId: `order-${input.orderId}`,
    name: `Pedido Lacis ${input.orderId.slice(0, 8)}`,
    description: `Pedido com ${input.itemCount} ${input.itemCount === 1 ? 'item' : 'itens'}, incluindo frete.`,
    price: input.totalCents,
    currency: 'BRL',
  });
  if (!product.id) throw new Error('AbacatePay não retornou o produto de cobrança.');

  const checkout = await request<{ id: string; url: string }>('/checkouts/create', {
    items: [{ id: product.id, quantity: 1 }],
    methods: ['PIX', 'CARD'],
    externalId: input.orderId,
    returnUrl: `${input.origin}/checkout`,
    completionUrl: `${input.origin}/checkout/success?orderId=${encodeURIComponent(input.orderId)}`,
    metadata: { orderId: input.orderId },
  });
  if (!checkout.id || !isSafeCheckoutUrl(checkout.url)) {
    throw new Error('AbacatePay não retornou um endereço de checkout válido.');
  }
  return checkout;
}

function isSafeCheckoutUrl(value: string) {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}
