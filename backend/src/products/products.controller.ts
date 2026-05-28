import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { join } from 'path';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('type') type?: string,
    @Query('brand') brand?: string,
  ) {
    return this.productsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
      categoryId ? parseInt(categoryId) : undefined,
      minPrice ? parseFloat(minPrice) : undefined,
      maxPrice ? parseFloat(maxPrice) : undefined,
      sortBy,
      sortOrder,
      type,
      brand,
    );
  }

  @Get('search')
  search(@Query('keyword') keyword: string) {
    return this.productsService.search(keyword);
  }

  @Get('top-viewed')
  getTopViewed(
    @Query('limit') limit?: string,
    @Query('start') start?: string,
    @Query('end') end?: string
  ) {
    return this.productsService.getTopViewedProducts(
      limit ? parseInt(limit) : 10,
      start,
      end
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.productsService.findOne(+id, req);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() createProductDto: CreateProductDto, @Request() req) {
    return this.productsService.create(createProductDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = join(process.cwd(), 'uploads');
          console.log('[BACKEND DEBUG] Upload directory:', uploadDir);
          
          // Auto-create directory if it doesn't exist
          const fs = require('fs');
          if (!fs.existsSync(uploadDir)) {
            console.log('[BACKEND DEBUG] Creating upload directory...');
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          
          console.log('[BACKEND DEBUG] Directory exists check:', fs.existsSync(uploadDir));
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => (Math.round(Math.random() * 16)).toString(16))
            .join('');
          const filename = `${randomName}${extname(file.originalname)}`;
          console.log('[BACKEND DEBUG] Generated filename:', filename);
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        console.log('[BACKEND DEBUG] File filter check:', file.mimetype);
        console.log('[BACKEND DEBUG] File originalname:', file.originalname);
        // Accept all image types
        if (file.mimetype && file.mimetype.startsWith('image/')) {
          console.log('[BACKEND DEBUG] File accepted:', file.mimetype);
          cb(null, true);
        } else {
          console.error('[BACKEND ERROR] Invalid file type:', file.mimetype);
          cb(null, false); // Don't throw error, just reject
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // Increased to 10MB
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Request() req: any) {
    try {
      console.log('[BACKEND DEBUG] Upload request received');
      console.log('[BACKEND DEBUG] Request body:', req.body);
      console.log('[BACKEND DEBUG] Request headers:', req.headers);
      console.log('[BACKEND DEBUG] File received:', file);
      
      if (!file) {
        console.error('[BACKEND ERROR] No file uploaded - file is undefined');
        console.error('[BACKEND ERROR] Request content-type:', req.headers['content-type']);
        throw new BadRequestException('No file uploaded - file is undefined');
      }
      
      console.log('[BACKEND DEBUG] File details:', {
        originalname: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        destination: file.destination,
      });
      
      const result = {
        filename: file.filename,
        originalname: file.originalname,
        url: `${process.env.API_URL || 'http://localhost:3001'}/uploads/${file.filename}`,
      };
      
      console.log('[BACKEND DEBUG] Returning result:', result);
      return result;
    } catch (error: any) {
      console.error('[BACKEND ERROR] Upload failed:', error);
      console.error('[BACKEND ERROR] Error stack:', error.stack);
      console.error('[BACKEND ERROR] Error message:', error.message);
      console.error('[BACKEND ERROR] Error name:', error.name);
      
      // Return error details for debugging
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }
  }
}
