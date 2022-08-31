export interface ProductDto {
    title: string;
    product_id: string;
    description: string;
    image: string;
    size?: number;
    categories: string[];
    color?: string;
    price: number;
    quantity: number;
    isActive?: boolean;
}