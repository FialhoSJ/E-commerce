import { getCatalogProduct } from '@/lib/server/catalog';
import { createHostedCheckout } from '@/lib/server/abacatepay';
import { hasSupabaseConfig, supabaseRequest } from '@/lib/server/supabase';
import { isValidPostalCode, quoteDevelopmentShipping } from '@/lib/shipping';
import type { ShippingAddress } from '@/lib/shipping';

type OrderItemInput = { id?: number; quantity?: number };
type CreatedOrder = { id: string; created_at: string };

export async function POST(request: Request) {
  if (!process.env.ABACATEPAY_API_KEY) return Response.json({ error: 'Configure ABACATEPAY_API_KEY no servidor.' }, { status: 503 });
  if (!hasSupabaseConfig()) return Response.json({ error: 'Configure o Supabase para persistir pedidos antes de iniciar o pagamento.' }, { status: 503 });

  try {
    const body = await request.json() as {
      email?: string;
      items?: OrderItemInput[];
      address?: ShippingAddress;
      shippingId?: string;
    };
    const email = body.email?.trim().toLowerCase() || '';
    const address = body.address;
    const inputItems = body.items ?? [];
    if (!/^\S+@\S+\.\S+$/.test(email)) return Response.json({ error: 'Informe um e-mail válido.' }, { status: 400 });
    if (!inputItems.length || inputItems.length > 30 || inputItems.some((item) => !Number.isSafeInteger(item.id) || (item.id as number) < 1 || !Number.isSafeInteger(item.quantity) || (item.quantity as number) < 1 || (item.quantity as number) > 50)) {
      return Response.json({ error: 'Carrinho inválido.' }, { status: 400 });
    }
    if (!address || !isValidPostalCode(address.postalCode) || !address.street?.trim() || !address.number?.trim() || !address.neighborhood?.trim() || !address.city?.trim() || !/^[A-Za-z]{2}$/.test(address.state || '')) {
      return Response.json({ error: 'Preencha o endereço de entrega.' }, { status: 400 });
    }

    const quantities = new Map<number, number>();
    for (const item of inputItems) quantities.set(item.id!, (quantities.get(item.id!) || 0) + item.quantity!);
    const products = await Promise.all([...quantities].map(async ([id, quantity]) => {
      const product = await getCatalogProduct(id);
      if (!product || product.price === null || !Number.isFinite(product.price) || product.price < 0) throw new Error('Um produto do carrinho não está mais disponível.');
      if ((product.stock ?? 0) < quantity) throw new Error(`Estoque insuficiente para ${product.title}.`);
      return { product, quantity, unitPriceCents: Math.round(product.price * 100) };
    }));
    const subtotalCents = products.reduce((total, item) => total + item.unitPriceCents * item.quantity, 0);
    if (!Number.isSafeInteger(subtotalCents) || subtotalCents <= 0) return Response.json({ error: 'O total do pedido precisa ser maior que zero.' }, { status: 400 });
    const shipping = quoteDevelopmentShipping(address.postalCode, subtotalCents / 100).find((option) => option.id === body.shippingId);
    if (!shipping) return Response.json({ error: 'Opção de frete inválida. Calcule o frete novamente.' }, { status: 400 });
    const shippingCents = Math.round(shipping.price * 100);
    const totalCents = subtotalCents + shippingCents;
    const profiles = await supabaseRequest<Array<{ id: string }>>(`profiles?select=id&email=eq.${encodeURIComponent(email)}&limit=1`);

    const created = await supabaseRequest<CreatedOrder[]>('orders?select=id,created_at', {
      method: 'POST',
      body: JSON.stringify({
        user_id: profiles[0]?.id ?? null,
        customer_email: email,
        status: 'pending_payment',
        subtotal_cents: subtotalCents,
        shipping_cents: shippingCents,
        total_cents: totalCents,
        shipping_method: shipping.name,
        shipping_estimate_days: shipping.deliveryDays,
        address_snapshot: { ...address, postalCode: address.postalCode.replace(/\D/g, '') },
      }),
    });
    const order = created[0];
    if (!order) throw new Error('Não foi possível registrar o pedido.');

    try {
      await supabaseRequest('order_items', {
        method: 'POST',
        body: JSON.stringify(products.map(({ product, quantity, unitPriceCents }) => ({
          order_id: order.id,
          title_snapshot: product.title,
          unit_price_cents: unitPriceCents,
          quantity,
        }))),
      });
    } catch (error) {
      await supabaseRequest(`orders?id=eq.${encodeURIComponent(order.id)}`, { method: 'DELETE' }).catch(() => undefined);
      throw error;
    }

    try {
      const checkout = await createHostedCheckout({
        orderId: order.id,
        totalCents,
        itemCount: products.reduce((sum, item) => sum + item.quantity, 0),
        origin: new URL(request.url).origin,
      });
      await supabaseRequest(`orders?id=eq.${encodeURIComponent(order.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ payment_provider: 'abacatepay', payment_reference: checkout.id, updated_at: new Date().toISOString() }),
      });
      return Response.json({
        order: {
          id: order.id,
          status: 'pending_payment',
          total: totalCents / 100,
          subtotal: subtotalCents / 100,
          shipping: shippingCents / 100,
          createdAt: order.created_at,
          items: products.map(({ product, quantity, unitPriceCents }) => ({ ...product, price: unitPriceCents / 100, quantity })),
        },
        checkoutUrl: checkout.url,
        paymentProvider: 'abacatepay',
      }, { status: 201 });
    } catch (error) {
      await supabaseRequest(`orders?id=eq.${encodeURIComponent(order.id)}`, { method: 'DELETE' }).catch(() => undefined);
      throw error;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível iniciar o pagamento.';
    return Response.json({ error: message }, { status: 400 });
  }
}
