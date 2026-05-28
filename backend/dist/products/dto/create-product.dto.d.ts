import { ProductStatus, ProductType } from '../entities/product.entity';
export declare class CreateProductDto {
    name: string;
    description: string;
    price: number;
    category_id: number;
    stock: number;
    type?: ProductType;
    brand?: string;
    status?: ProductStatus;
    image_urls?: string[];
}
