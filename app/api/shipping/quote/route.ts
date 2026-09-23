import { NextRequest } from 'next/server';
import { isValidPostalCode, quoteDevelopmentShipping } from '@/lib/shipping';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { postalCode?: string; subtotal?: number };
    const postalCode = body.postalCode?.replace(/\D/g, '') ?? '';
    const subtotal = Number(body.subtotal ?? 0);
    if (!isValidPostalCode(postalCode)) return Response.json({ error: 'Informe um CEP válido.' }, { status: 400 });
    if (!Number.isFinite(subtotal) || subtotal < 0) return Response.json({ error: 'Subtotal inválido.' }, { status: 400 });

    // Integração real deve acontecer aqui, sempre no servidor.
    return Response.json({ provider: process.env.MELHOR_ENVIO_TOKEN ? 'melhor-envio' : 'development', options: quoteDevelopmentShipping(postalCode, subtotal) });
  } catch {
    return Response.json({ error: 'Não foi possível calcular o frete.' }, { status: 400 });
  }
}
