import { ProductImage } from './product-image.entity';
export declare enum ProductStatus {
    ACTIVE = "active",
    INACTIVE = "inactive"
}
export declare enum ProductType {
    NOTEBOOK = "notebook",
    PC = "pc"
}
export declare class Product {
    id: number;
    name: string;
    description: string;
    price: number;
    category: any;
    category_id: number;
    stock: number;
    type: ProductType;
    brand: string;
    status: ProductStatus;
    createdBy: any;
    created_by: number;
    created_at: Date;
    images: ProductImage[];
    reviews: any[];
    favorites: any[];
}
