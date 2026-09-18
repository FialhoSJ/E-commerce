'use client'
import { ProductType } from "@/lib/types/ProductType"
import Productimage from "./Productimage"
import Link from "next/link"


type ProductProps = {
    product: ProductType
}
export default function Product({ product }: ProductProps) {
    return (
        <div className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="relative h-64 rounded-2xl bg-slate-50">
                <Productimage product={product} fill />
            </div>
            <div className="my-4 flex justify-between gap-3 font-semibold">
                <p className="truncate text-sm">
                    {product.title}
                </p>
                <p className="shrink-0 text-sm text-teal-700">
                    {product.price?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
            </div>
            <Link href={`/produto/${product.id}`} className="rounded-full border border-slate-300 px-3.5 py-2.5 text-center text-sm font-semibold transition hover:border-slate-950 hover:bg-slate-950 hover:text-white">Ver detalhes</Link>
        </div>
    )
}
