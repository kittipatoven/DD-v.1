import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(page?: string, limit?: string, search?: string, categoryId?: string, minPrice?: string, maxPrice?: string, sortBy?: string, sortOrder?: 'ASC' | 'DESC', type?: string, brand?: string): Promise<{
        products: import("./entities/product.entity").Product[];
        total: number;
    }>;
    search(keyword: string): Promise<import("./entities/product.entity").Product[]>;
    getTopViewed(limit?: string, start?: string, end?: string): Promise<any[]>;
    findOne(id: string, req: any): Promise<import("./entities/product.entity").Product>;
    create(createProductDto: CreateProductDto, req: any): Promise<import("./entities/product.entity").Product>;
    update(id: string, updateProductDto: UpdateProductDto): Promise<import("./entities/product.entity").Product>;
    remove(id: string): Promise<void>;
    uploadFile(file: Express.Multer.File, req: any): Promise<{
        filename: string;
        originalname: string;
        url: string;
    }>;
}
