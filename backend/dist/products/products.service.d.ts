import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductView } from './entities/product-view.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsService {
    private productsRepository;
    private productImagesRepository;
    private productViewRepository;
    constructor(productsRepository: Repository<Product>, productImagesRepository: Repository<ProductImage>, productViewRepository: Repository<ProductView>);
    create(createProductDto: CreateProductDto, userId: number): Promise<Product>;
    findAll(page?: number, limit?: number, search?: string, categoryId?: number, minPrice?: number, maxPrice?: number, sortBy?: string, sortOrder?: 'ASC' | 'DESC', type?: string, brand?: string): Promise<{
        products: Product[];
        total: number;
    }>;
    findOne(id: number, req?: any): Promise<Product>;
    update(id: number, updateProductDto: UpdateProductDto): Promise<Product>;
    remove(id: number): Promise<void>;
    search(keyword: string): Promise<Product[]>;
    getTopViewedProducts(limit?: number, startDate?: string, endDate?: string): Promise<any[]>;
}
