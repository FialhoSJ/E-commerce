export type ShippingAddress = {
  postalCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
};

export type ShippingOption = {
  id: string;
  name: string;
  price: number;
  deliveryDays: number;
  description: string;
};

const cleanCep = (value: string) => value.replace(/\D/g, '');

export function isValidPostalCode(value: string) {
  return /^\d{8}$/.test(cleanCep(value));
}

/**
 * Cotação local para desenvolvimento. Em produção, substitua o conteúdo por
 * uma chamada server-side ao Melhor Envio/Frenet usando credenciais privadas.
 */
export function quoteDevelopmentShipping(postalCode: string, subtotal: number): ShippingOption[] {
  const cep = cleanCep(postalCode);
  const prefix = Number(cep.slice(0, 2));
  const regional = prefix >= 1 && prefix <= 19;
  const free = subtotal >= 250;
  return [
    { id: 'standard', name: 'Entrega padrão', price: free ? 0 : regional ? 18.9 : 29.9, deliveryDays: regional ? 5 : 10, description: free ? 'Frete grátis para compras acima de R$ 250' : 'Rastreamento incluído' },
    { id: 'express', name: 'Entrega expressa', price: regional ? 29.9 : 44.9, deliveryDays: regional ? 2 : 6, description: 'Prioridade na entrega' },
  ];
}
