import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { RepairsService } from './repairs.service';
import { CreateRepairDto } from './dto/create-repair.dto';
import { UpdateRepairDto } from './dto/update-repair.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { join } from 'path';

@Controller('repairs')
export class RepairsController {
  constructor(private readonly repairsService: RepairsService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.repairsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      status,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.repairsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = join(process.cwd(), 'uploads', 'repairs');
          const fs = require('fs');
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => (Math.round(Math.random() * 16)).toString(16))
            .join('');
          const filename = `${randomName}${extname(file.originalname)}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype && file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(null, false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  async create(
    @Body() createRepairDto: CreateRepairDto,
    @Request() req,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one image is required');
    }

    const imageUrls = files.map(file => 
      `${process.env.API_URL || 'http://localhost:3001'}/uploads/repairs/${file.filename}`
    );

    const { RepairImageType } = require('./entities/repair-image.entity');
    const repairWithImages = {
      ...createRepairDto,
      images: imageUrls.map(url => ({ image_url: url, image_type: RepairImageType.AFTER })),
    };

    return this.repairsService.create(repairWithImages, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRepairDto: UpdateRepairDto) {
    return this.repairsService.update(+id, updateRepairDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.repairsService.remove(+id);
  }
}
