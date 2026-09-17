import { ProductType } from "@/lib/types/ProductType";

async function getProducts() {
  const res = await fetch('https://fakestoreapi.com/products')
  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }

  return res.json();
}

export default async function Home() {
  const products = await getProducts();

  
  return (
    <div className="max-w-7xl mx-auto pt-8 px-8 xl:px-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 
      gap-6">

        {products.map((product: any) => (
          <div key={product.id}>{product.title}</div>
        ))}

      </div>
      <h1>Page-commerce</h1>
    </div>
  );
}