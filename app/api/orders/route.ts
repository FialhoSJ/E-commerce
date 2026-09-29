import { getCatalogProduct } from '@/lib/server/catalog';
import { createHostedCheckout } from '@/lib/server/abacatepay';
import { hasSupabaseConfig, supabaseRequest } from '@/lib/server/supabase';
import { createClient as createAuthClient } from '@/lib/supabase/server';
import { isValidPostalCode, quoteDevelopmentShipping } from '@/lib/shipping';
import type { ShippingAddress } from '@/lib/shipping';

type OrderItemInput = { id?: number; quantity?: number };
type CreatedOrder = { id: string; created_at: string };

export async function POST(request: Request) {
  if (!process.env.ABACATEPAY_API_KEY) return Response.json({ error: 'Configure ABACATEPAY_API_KEY no servidor.' }, { status: 503 });
  if (!hasSupabaseConfig()) return Response.json({ error: 'Configure o Supabase para persistir pedidos antes de iniciar o pagamento.' }, { status: 503 });

  let userId: string;
  let email: string;
  try {
    const authClient = await createAuthClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user?.email) return Response.json({ error: 'Entre na sua conta para continuar.' }, { status: 401 });
    if (!user.email_confirmed_at) return Response.json({ error: 'Confirme seu e-mail antes de fazer o pedido.' }, { status: 403 });
    userId = user.id;
    email = user.email.trim().toLowerCase();
  } catch {
    return Response.json({ error: 'Configure as variáveis públicas de autenticação do Supabase no servidor.' }, { status: 503 });
  }

  try {
    const body = await request.json() as {
      items?: OrderItemInput[];
      address?: ShippingAddress;
      shippingId?: string;
    };
    const address = body.address;
    const inputItems = body.items ?? [];
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
    const created = await supabaseRequest<CreatedOrder[]>('orders?select=id,created_at', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
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

    let checkout: Awaited<ReturnType<typeof createHostedCheckout>>;
    try {
      checkout = await createHostedCheckout({
        orderId: order.id,
        totalCents,
        itemCount: products.reduce((sum, item) => sum + item.quantity, 0),
        origin: new URL(request.url).origin,
      });
    } catch (error) {
      await supabaseRequest(`orders?id=eq.${encodeURIComponent(order.id)}`, { method: 'DELETE' }).catch(() => undefined);
      throw error;
    }

    // Keep the order if this bookkeeping update fails: the checkout already
    // exists, and its externalId lets the webhook find the pending order.
    await supabaseRequest(`orders?id=eq.${encodeURIComponent(order.id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ payment_provider: 'abacatepay', payment_reference: checkout.id, updated_at: new Date().toISOString() }),
    }).catch((error) => console.error('Could not save AbacatePay reference for order', order.id, error));

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
    const message = error instanceof Error ? error.message : 'Não foi possível iniciar o pagamento.';
    return Response.json({ error: message }, { status: 400 });
  }
}
