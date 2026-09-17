'use client'
import { ProductType } from "@/lib/types/ProductType";
import Image from "next/image";
import { useState } from "react";

type ProductImageProps = {
    product: ProductType;
    fill?: boolean;
};

export default function ProductImage({ product, fill }: ProductImageProps) {
    const [loading, setLoading] = useState(true);

    const imageClasses = `object-cover duration-700 ease-in-out transition-all ${loading
            ? 'scale-110 blur-2xl grayscale'
            : 'scale-100 blur-0 grayscale-0'
        }`;

    return fill ? (
        <Image
            src={product.image}
            alt={product.title}
            fill
            className={imageClasses}
            onLoad={() => setLoading(false)}
        />
    ) : (
        <Image
            src={product.image}
            alt={product.title}
            width={400}
            height={700}
            className={imageClasses}
            onLoad={() => setLoading(false)}
        />
    );
}