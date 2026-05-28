import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Product, ProductStatus } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductView } from './entities/product-view.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private productImagesRepository: Repository<ProductImage>,
    @InjectRepository(ProductView)
    private productViewRepository: Repository<ProductView>,
  ) {}

  async create(createProductDto: CreateProductDto, userId: number): Promise<Product> {
    const { image_urls, ...productData } = createProductDto;

    // Validate stock is not negative
    if (productData.stock < 0) {
      throw new BadRequestException('Stock cannot be negative');
    }

    // Validate notebook requires brand
    if (productData.type === 'notebook' && !productData.brand) {
      throw new BadRequestException('Notebook products must have a brand');
    }

    const product = this.productsRepository.create({
      ...productData,
      created_by: userId,
    });

    const savedProduct = await this.productsRepository.save(product);

    if (image_urls && image_urls.length > 0) {
      const images = image_urls.map((url) =>
        this.productImagesRepository.create({
          image_url: url,
          product_id: savedProduct.id,
        }),
      );
      await this.productImagesRepository.save(images);
    }

    return this.findOne(savedProduct.id);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    categoryId?: number,
    minPrice?: number,
    maxPrice?: number,
    sortBy?: string,
    sortOrder: 'ASC' | 'DESC' = 'DESC',
    type?: string,
    brand?: string,
  ): Promise<{ products: Product[]; total: number }> {
    const queryBuilder = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.createdBy', 'createdBy')
      .where('product.status = :status', { status: ProductStatus.ACTIVE });

    if (search) {
      queryBuilder.andWhere(
        '(product.name LIKE :search OR product.description LIKE :search)',
        { search: `%${search}%` },
      );
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

    // Sort logic
    const allowedSortFields = ['name', 'price', 'created_at', 'stock'];
    const sortField = allowedSortFields.includes(sortBy || '') ? sortBy : 'created_at';

    const [products, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy(`product.${sortField}`, sortOrder)
      .getManyAndCount();

    return { products, total };
  }

  async findOne(id: number, req?: any): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['category', 'images', 'reviews', 'createdBy'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Track product view (don't await to avoid blocking response)
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

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    const { image_urls, category_id, ...productData } = updateProductDto;

    // Validate stock is not negative
    if (productData.stock !== undefined && productData.stock < 0) {
      throw new BadRequestException('Stock cannot be negative');
    }

    // Build update object with only defined fields
    const updateData: any = {};
    if (productData.name !== undefined) updateData.name = productData.name;
    if (productData.description !== undefined) updateData.description = productData.description;
    if (productData.price !== undefined) updateData.price = productData.price;
    if (productData.stock !== undefined) updateData.stock = productData.stock;
    if (productData.status !== undefined) updateData.status = productData.status;
    if (category_id !== undefined) updateData.category_id = category_id;

    // Update using repository to ensure all fields are saved
    await this.productsRepository.update(id, updateData);

    if (image_urls !== undefined) {
      // Remove old images
      await this.productImagesRepository.delete({ product_id: id });

      // Add new images
      if (image_urls && image_urls.length > 0) {
        const images = image_urls.map((url) =>
          this.productImagesRepository.create({
            image_url: url,
            product_id: id,
          }),
        );
        await this.productImagesRepository.save(images);
      }
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
  }

  async search(keyword: string): Promise<Product[]> {
    return this.productsRepository.find({
      where: [
        { name: Like(`%${keyword}%`) },
        { description: Like(`%${keyword}%`) },
      ],
      relations: ['category', 'images'],
      take: 20,
    });
  }

  async getTopViewedProducts(limit: number = 10, startDate?: string, endDate?: string) {
    const queryBuilder = this.productsRepository
      .createQueryBuilder('product')
      .leftJoin('product_views', 'pv', 'pv.product_id = product.id')
      .select('product.id', 'id')
      .addSelect('product.name', 'name')
      .addSelect('COUNT(pv.id)', 'views')
      .where('product.status = :status', { status: ProductStatus.ACTIVE })
      .groupBy('product.id');

    // Filter by date range if provided
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
}
