'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ProductType } from '@/lib/types/ProductType';
import { useStore } from './StoreProvider';

export interface ProductCardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  imageUrl: string;
  name: string;
  tagline: string;
  price: number;
  currency?: string;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
  isCouponPrice?: boolean;
  originalPrice?: number;
  offerText: string;
  href?: string;
}

const ProductCard = React.forwardRef<HTMLDivElement, ProductCardProps>(
  ({ className, imageUrl, name, tagline, price, currency = 'R$', isCouponPrice = false, originalPrice, offerText, href, onAddToCart, onBuyNow, ...props }, ref) => {
    const formatPrice = (amount: number) =>
      new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: currency === 'R$' ? 'BRL' : 'USD',
        minimumFractionDigits: 2,
      }).format(amount);

    return (
      <motion.div
        ref={ref}
        className={cn(
          'group relative flex h-full w-full flex-col items-center justify-start overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 text-center text-slate-950 shadow-sm transition-all duration-300 ease-in-out hover:shadow-md',
          className,
        )}
        whileHover={{ y: -5 }}
        transition={{ type: 'spring', stiffness: 300 }}
        {...props}
      >
        <div className="relative mb-5 flex h-44 w-full items-center justify-center rounded-2xl bg-slate-50 p-4">
          <Image
            src={imageUrl}
            unoptimized
            alt={name}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw"
            className="object-contain p-5 transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <div className="flex w-full flex-grow flex-col items-center gap-2">
          <h3 className="line-clamp-2 min-h-12 font-semibold capitalize">{name}</h3>
          <p className="line-clamp-2 text-sm text-slate-500">{tagline}</p>
        </div>

        <div className="mt-5 flex w-full flex-col items-center gap-3">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold">{formatPrice(price)}</span>
            {isCouponPrice && <span className="text-xs font-medium text-teal-700">Preço com cupom</span>}
          </div>
          <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
            {originalPrice !== undefined && <span className="text-slate-400 line-through">{formatPrice(originalPrice)}</span>}
            <span className="font-semibold text-amber-600">{offerText}</span>
          </div>
          <div className="grid w-full gap-2 sm:grid-cols-2">
            {onAddToCart && <button onClick={onAddToCart} className="rounded-full border border-slate-300 px-3 py-2.5 text-xs font-semibold text-slate-800 transition hover:border-teal-600 hover:text-teal-700">Adicionar ao carrinho</button>}
            {onBuyNow && <button onClick={onBuyNow} className="rounded-full bg-teal-600 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-teal-500">Comprar agora</button>}
          </div>
          {href && <Link href={href} className="mt-1 text-sm font-semibold text-slate-600 transition hover:text-teal-700">Ver detalhes →</Link>}
        </div>
      </motion.div>
    );
  },
);

ProductCard.displayName = 'ProductCard';

export function Product({ product }: { product: ProductType }) {
  const router = useRouter();
  const { user, addToCart } = useStore();
  const add = () => { addToCart(product); toast.success(`${product.title} adicionado ao carrinho.`); };
  const buyNow = () => {
    addToCart(product);
    router.push(user ? '/checkout' : '/auth?redirect=/checkout');
  };

  return (
    <ProductCard
      imageUrl={product.image}
      name={product.title}
      tagline={product.description || product.category}
      price={product.price ?? 0}
      currency="R$"
      offerText="Oferta especial"
      href={`/produto/${product.id}`}
      onAddToCart={add}
      onBuyNow={buyNow}
    />
  );
}

export default Product;
