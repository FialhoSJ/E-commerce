const SANDBOX_URL = 'https://api-sandbox.asaas.com/v3';
const PRODUCTION_URL = 'https://api.asaas.com/v3';

type AsaasEnvelope<T> = T & { errors?: Array<{ description?: string }> };

async function asaasRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const apiKey = process.env.ASAAS_API_KEY;
  if (!apiKey) throw new Error('Configure ASAAS_API_KEY no servidor.');
  const environment = process.env.ASAAS_ENVIRONMENT || 'sandbox';
  if (environment !== 'sandbox' && environment !== 'production') {
    throw new Error('ASAAS_ENVIRONMENT deve ser sandbox ou production.');
  }
  const baseUrl = environment === 'production' ? PRODUCTION_URL : SANDBOX_URL;
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      access_token: apiKey,
      'Content-Type': 'application/json',
      'User-Agent': 'LacisEcommerce/1.0',
      ...init?.headers,
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(20_000),
  });
  const result = await response.json().catch(() => null) as AsaasEnvelope<T> | null;
  if (!response.ok || !result) {
    const detail = result?.errors?.map((error) => error.description).filter(Boolean).join(' ');
    throw new Error(detail || `Asaas respondeu ${response.status}.`);
  }
  return result;
}

type AsaasCustomer = { id: string; externalReference?: string };
type CustomerList = { data?: AsaasCustomer[] };

async function findOrCreateCustomer(input: { userId: string; name: string; email: string; cpf: string }) {
  const query = new URLSearchParams({ externalReference: input.userId, limit: '1' });
  const existing = await asaasRequest<CustomerList>(`/customers?${query}`);
  if (existing.data?.[0]?.id) return existing.data[0].id;

  const customer = await asaasRequest<AsaasCustomer>('/customers', {
    method: 'POST',
    body: JSON.stringify({
      name: input.name,
      email: input.email,
      cpfCnpj: input.cpf,
      externalReference: input.userId,
      notificationDisabled: true,
    }),
  });
  if (!customer.id) throw new Error('Asaas não retornou o identificador do cliente.');
  return customer.id;
}

export async function createAsaasPayment(input: {
  userId: string;
  customerName: string;
  customerEmail: string;
  customerCpf: string;
  orderId: string;
  totalCents: number;
  origin: string;
}) {
  const customerId = await findOrCreateCustomer({
    userId: input.userId,
    name: input.customerName,
    email: input.customerEmail,
    cpf: input.customerCpf,
  });
  const dateParts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Belem',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const datePart = (type: Intl.DateTimeFormatPartTypes) => dateParts.find((part) => part.type === type)?.value || '';
  const dueDate = new Date(Date.UTC(Number(datePart('year')), Number(datePart('month')) - 1, Number(datePart('day')) + 1));
  const payment = await asaasRequest<{ id: string; invoiceUrl: string }>('/payments', {
    method: 'POST',
    body: JSON.stringify({
      customer: customerId,
      billingType: 'UNDEFINED',
      value: input.totalCents / 100,
      dueDate: dueDate.toISOString().slice(0, 10),
      description: `Pedido Lacis ${input.orderId.slice(0, 8)}`,
      externalReference: input.orderId,
      callback: {
        successUrl: `${input.origin}/checkout/success?orderId=${encodeURIComponent(input.orderId)}`,
        autoRedirect: true,
      },
    }),
  });
  let checkoutUrl: URL;
  try { checkoutUrl = new URL(payment.invoiceUrl); } catch { throw new Error('Asaas não retornou o link de pagamento.'); }
  if (checkoutUrl.protocol !== 'https:' || !['asaas.com', 'asaas.com.br'].some((domain) => checkoutUrl.hostname === domain || checkoutUrl.hostname.endsWith(`.${domain}`))) {
    throw new Error('Asaas retornou um endereço de pagamento inválido.');
  }
  if (!payment.id) throw new Error('Asaas não retornou o identificador da cobrança.');
  return { id: payment.id, url: checkoutUrl.toString() };
}

export function isValidCpf(value: string) {
  const cpf = value.replace(/\D/g, '');
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
  const digit = (length: number) => {
    const sum = cpf.slice(0, length).split('').reduce((total, number, index) => total + Number(number) * (length + 1 - index), 0);
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };
  return digit(9) === Number(cpf[9]) && digit(10) === Number(cpf[10]);
}
