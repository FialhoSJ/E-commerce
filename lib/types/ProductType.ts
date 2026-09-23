export type ProductType = {
    id: number;
    title: string;
    price: number | null;
    description: string | null;
    category: string;
    image: string;
    stock?: number;
};

export type ProductReview = {
    id: string;
    productId: number;
    author: string;
    rating: number;
    comment: string;
    createdAt: string;
};
