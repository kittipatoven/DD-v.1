"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./entities/product.entity");
const product_image_entity_1 = require("./entities/product-image.entity");
const product_view_entity_1 = require("./entities/product-view.entity");
let ProductsService = class ProductsService {
    constructor(productsRepository, productImagesRepository, productViewRepository) {
        this.productsRepository = productsRepository;
        this.productImagesRepository = productImagesRepository;
        this.productViewRepository = productViewRepository;
    }
    async create(createProductDto, userId) {
        const { image_urls, ...productData } = createProductDto;
        if (productData.stock < 0) {
            throw new common_1.BadRequestException('Stock cannot be negative');
        }
        if (productData.type === 'notebook' && !productData.brand) {
            throw new common_1.BadRequestException('Notebook products must have a brand');
        }
        const product = this.productsRepository.create({
            ...productData,
            created_by: userId,
        });
        const savedProduct = await this.productsRepository.save(product);
        if (image_urls && image_urls.length > 0) {
            const images = image_urls.map((url) => this.productImagesRepository.create({
                image_url: url,
                product_id: savedProduct.id,
            }));
            await this.productImagesRepository.save(images);
        }
        return this.findOne(savedProduct.id);
    }
    async findAll(page = 1, limit = 10, search, categoryId, minPrice, maxPrice, sortBy, sortOrder = 'DESC', type, brand) {
        const queryBuilder = this.productsRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category')
            .leftJoinAndSelect('product.images', 'images')
            .leftJoinAndSelect('product.createdBy', 'createdBy')
            .where('product.status = :status', { status: product_entity_1.ProductStatus.ACTIVE });
        if (search) {
            queryBuilder.andWhere('(product.name LIKE :search OR product.description LIKE :search)', { search: `%${search}%` });
        }
        if (categoryId) {
            queryBuilder.andWhere('product.category_id = :categoryId', { categoryId });
        }
        if (type) {
            queryBuilder.andWhere('product.type = :type', { type });
        }
        if (brand) {
            queryBuilder.andWhere('product.brand = :brand', { brand });
        }
        if (minPrice !== undefined && maxPrice !== undefined) {
            queryBuilder.andWhere('product.price BETWEEN :minPrice AND :maxPrice', {
                minPrice,
                maxPrice,
            });
        }
        const allowedSortFields = ['name', 'price', 'created_at', 'stock'];
        const sortField = allowedSortFields.includes(sortBy || '') ? sortBy : 'created_at';
        const [products, total] = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy(`product.${sortField}`, sortOrder)
            .getManyAndCount();
        return { products, total };
    }
    async findOne(id, req) {
        const product = await this.productsRepository.findOne({
            where: { id },
            relations: ['category', 'images', 'reviews', 'createdBy'],
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const clientIp = req?.ip || req?.headers['x-forwarded-for'] || req?.connection?.remoteAddress || null;
        const userId = req?.user?.id || null;
        this.productViewRepository.save({
            product_id: id,
            user_id: userId,
            ip_address: clientIp,
            created_at: new Date(),
        }).catch(err => console.error('Failed to track product view:', err));
        return product;
    }
    async update(id, updateProductDto) {
        const product = await this.findOne(id);
        const { image_urls, category_id, ...productData } = updateProductDto;
        if (productData.stock !== undefined && productData.stock < 0) {
            throw new common_1.BadRequestException('Stock cannot be negative');
        }
        const updateData = {};
        if (productData.name !== undefined)
            updateData.name = productData.name;
        if (productData.description !== undefined)
            updateData.description = productData.description;
        if (productData.price !== undefined)
            updateData.price = productData.price;
        if (productData.stock !== undefined)
            updateData.stock = productData.stock;
        if (productData.status !== undefined)
            updateData.status = productData.status;
        if (category_id !== undefined)
            updateData.category_id = category_id;
        await this.productsRepository.update(id, updateData);
        if (image_urls !== undefined) {
            await this.productImagesRepository.delete({ product_id: id });
            if (image_urls && image_urls.length > 0) {
                const images = image_urls.map((url) => this.productImagesRepository.create({
                    image_url: url,
                    product_id: id,
                }));
                await this.productImagesRepository.save(images);
            }
        }
        return this.findOne(id);
    }
    async remove(id) {
        const product = await this.findOne(id);
        await this.productsRepository.remove(product);
    }
    async search(keyword) {
        return this.productsRepository.find({
            where: [
                { name: (0, typeorm_2.Like)(`%${keyword}%`) },
                { description: (0, typeorm_2.Like)(`%${keyword}%`) },
            ],
            relations: ['category', 'images'],
            take: 20,
        });
    }
    async getTopViewedProducts(limit = 10, startDate, endDate) {
        const queryBuilder = this.productsRepository
            .createQueryBuilder('product')
            .leftJoin('product_views', 'pv', 'pv.product_id = product.id')
            .select('product.id', 'id')
            .addSelect('product.name', 'name')
            .addSelect('COUNT(pv.id)', 'views')
            .where('product.status = :status', { status: product_entity_1.ProductStatus.ACTIVE })
            .groupBy('product.id');
        if (startDate && endDate) {
            queryBuilder.andWhere('pv.created_at BETWEEN :startDate AND :endDate', {
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            });
        }
        return queryBuilder
            .orderBy('views', 'DESC')
            .limit(limit)
            .getRawMany();
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(product_image_entity_1.ProductImage)),
    __param(2, (0, typeorm_1.InjectRepository)(product_view_entity_1.ProductView)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ProductsService);
//# sourceMappingURL=products.service.js.map