import { Product } from './product.entity';
export declare class ProductView {
    id: number;
    product_id: number;
    product: Product;
    user_id: number;
    ip_address: string;
    created_at: Date;
}
