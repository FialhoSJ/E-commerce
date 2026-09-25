import { NextRequest } from 'next/server';
import { isValidPostalCode } from '@/lib/shipping';
import type { ShippingAddress } from '@/lib/shipping';
import { hasSupabaseConfig, supabaseRequest } from '@/lib/server/supabase';

type OrderItemInput = { id: number; title: string; price: number | null; quantity: number };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { email?: string; items?: OrderItemInput[]; address?: ShippingAddress; shipping?: { id?: string; name?: string; price?: number; deliveryDays?: number } };
    const items = body.items ?? [];
    const address = body.address;
    const shipping = body.shipping;
    if (!body.email || !/^\S+@\S+\.\S+$/.test(body.email)) return Response.json({ error: 'Usuário inválido.' }, { status: 400 });
    if (!items.length || items.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1 || item.price === null || item.price < 0)) return Response.json({ error: 'Carrinho inválido.' }, { status: 400 });
    if (!address || !isValidPostalCode(address.postalCode) || !address.street || !address.number || !address.neighborhood || !address.city || !/^[A-Za-z]{2}$/.test(address.state)) return Response.json({ error: 'Preencha o endereço de entrega.' }, { status: 400 });
    if (!shipping || !shipping.id || typeof shipping.price !== 'number' || shipping.price < 0 || !shipping.deliveryDays) return Response.json({ error: 'Escolha uma opção de frete.' }, { status: 400 });

    const subtotal = items.reduce((total, item) => total + (item.price as number) * item.quantity, 0);
    const total = subtotal + shipping.price;
    const order = { id: `3DS-${Date.now().toString(36).toUpperCase()}`, status: 'pending_payment', email: body.email, items, address, shipping, subtotal, total, createdAt: new Date().toISOString() };

    if (hasSupabaseConfig()) {
      const profiles = await supabaseRequest<Array<{ id: string }>>(`profiles?select=id&email=eq.${encodeURIComponent(body.email)}`);
      const profile = profiles[0];
      if (!profile) {
        return Response.json({
          order,
          persistence: 'local',
          message: 'Esta conta existe somente neste navegador. O pedido foi salvo localmente e não aparecerá em outros dispositivos.',
        }, { status: 201 });
      }
      const persisted = await supabaseRequest<Array<{ id: string; created_at: string }>>('orders', {
        method: 'POST',
        body: JSON.stringify({ user_id: profile.id, status: 'pending_payment', subtotal_cents: Math.round(subtotal * 100), shipping_cents: Math.round(shipping.price * 100), total_cents: Math.round(total * 100), shipping_method: shipping.name, shipping_estimate_days: shipping.deliveryDays, address_snapshot: address }),
      });
      const saved = persisted[0];
      if (!saved) throw new Error('Pedido não foi persistido.');
      await supabaseRequest('order_items', { method: 'POST', body: JSON.stringify(items.map((item) => ({ order_id: saved.id, title_snapshot: item.title, unit_price_cents: Math.round((item.price as number) * 100), quantity: item.quantity }))) });
      return Response.json({ order: { ...order, id: saved.id, createdAt: saved.created_at }, persistence: 'database', payment: { status: 'pending', message: 'Pedido persistido. Conecte o gateway para gerar o pagamento.' } }, { status: 201 });
    }

    // Modo development: mantém o fluxo demonstrável sem credenciais externas.
    return Response.json({ order, persistence: 'local', payment: { status: 'pending', message: 'Pedido criado somente neste navegador. Conecte uma conta Supabase para persistir o pedido.' } }, { status: 201 });
  } catch {
    return Response.json({ error: 'Não foi possível criar o pedido.' }, { status: 400 });
  }
}
