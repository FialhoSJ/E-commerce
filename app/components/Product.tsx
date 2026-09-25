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
          'group relative flex h-full w-full flex-col items-stretch justify-start overflow-hidden rounded-[1.35rem] border border-[#d9d2c5] bg-[#f8f6f0] p-3 text-left text-[#242622] shadow-sm transition-all duration-300 ease-in-out hover:border-[#b9ad9e] hover:shadow-[0_18px_40px_-24px_rgba(36,38,34,.45)]',
          className,
        )}
        whileHover={{ y: -5 }}
        transition={{ type: 'spring', stiffness: 300 }}
        {...props}
      >
        <div className="product-card-image relative mb-4 flex h-52 w-full items-center justify-center overflow-hidden rounded-[1rem] p-4">
          <Image
            src={imageUrl}
            unoptimized
            alt={name}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw"
            className="z-[1] object-contain p-5 transition-transform duration-500 group-hover:scale-110"
          />
        </div>

        <div className="flex w-full flex-grow flex-col items-start gap-2 px-2">
          <p className="text-[9px] font-bold uppercase tracking-[.2em] text-[#ef6b3b]">LACIS / FEITO EM 3D</p>
          <h3 className="line-clamp-2 min-h-7 font-serif text-xl capitalize">{name}</h3>
          <p className="line-clamp-2 text-sm text-[#777568]">{tagline}</p>
        </div>

        <div className="mt-5 flex w-full flex-col items-stretch gap-3 px-2 pb-2">
          <div className="flex items-end justify-between gap-2">
            <span className="font-serif text-2xl">{formatPrice(price)}</span>
            {isCouponPrice && <span className="text-xs font-medium text-[#6b7046]">Preço com cupom</span>}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#777568]">
            {originalPrice !== undefined && <span className="line-through">{formatPrice(originalPrice)}</span>}
            <span className="font-semibold text-[#6b7046]">{offerText}</span>
          </div>
          <div className="grid w-full gap-2 sm:grid-cols-2">
            {onAddToCart && <button onClick={onAddToCart} className="rounded-full border border-[#d9d2c5] px-3 py-2.5 text-xs font-bold text-[#242622] transition hover:border-[#ef6b3b] hover:text-[#c94924]">Adicionar</button>}
            {onBuyNow && <button onClick={onBuyNow} className="rounded-full bg-[#242622] px-3 py-2.5 text-xs font-bold text-white transition hover:bg-[#ef6b3b]">Comprar ↗</button>}
          </div>
          {href && <Link href={href} className="mt-1 text-xs font-bold text-[#777568] transition hover:text-[#ef6b3b]">Ver detalhes ↗</Link>}
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
