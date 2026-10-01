const ASAAS_API_URLS = {
  production: 'https://api.asaas.com/v3',
  sandbox: 'https://api-sandbox.asaas.com/v3',
} as const;

type AsaasError = { description?: string };
type AsaasCheckoutResponse = { id?: string; link?: string };

function getEnvironment() {
  const environment = process.env.ASAAS_ENVIRONMENT || 'sandbox';
  if (environment !== 'sandbox' && environment !== 'production') {
    throw new Error('ASAAS_ENVIRONMENT deve ser "sandbox" ou "production".');
  }
  return environment;
}

export async function createAsaasCheckout(input: {
  orderId: string;
  items: Array<{ name: string; quantity: number; value: number }>;
  origin: string;
}) {
  const apiKey = process.env.ASAAS_API_KEY;
  if (!apiKey) throw new Error('Asaas não está configurado no servidor.');

  const environment = getEnvironment();
  const response = await fetch(`${ASAAS_API_URLS[environment]}/checkouts`, {
    method: 'POST',
    headers: {
      access_token: apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      billingTypes: ['PIX', 'CREDIT_CARD'],
      chargeTypes: ['DETACHED'],
      minutesToExpire: 1440,
      externalReference: input.orderId,
      callback: {
        successUrl: `${input.origin}/checkout/success?orderId=${encodeURIComponent(input.orderId)}`,
        cancelUrl: `${input.origin}/checkout?payment=cancelled`,
        expiredUrl: `${input.origin}/checkout?payment=expired`,
      },
      items: input.items,
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(20_000),
  });

  const result = await response.json().catch(() => null) as (AsaasCheckoutResponse & { errors?: AsaasError[] }) | null;
  if (!response.ok || !result?.id || !result.link) {
    const errorMessage = result?.errors?.map((error) => error.description).filter(Boolean).join(' ');
    throw new Error(errorMessage || `Asaas respondeu ${response.status} ao criar o checkout.`);
  }

  let checkoutUrl: URL;
  try {
    checkoutUrl = new URL(result.link);
  } catch {
    throw new Error('Asaas retornou um link de checkout inválido.');
  }
  const allowedHost = environment === 'sandbox' ? 'sandbox.asaas.com' : 'asaas.com';
  if (checkoutUrl.protocol !== 'https:' || (checkoutUrl.hostname !== allowedHost && checkoutUrl.hostname !== `www.${allowedHost}`)) {
    throw new Error('Asaas retornou um endereço de checkout não permitido.');
  }

  return { id: result.id, url: checkoutUrl.toString() };
}
