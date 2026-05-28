import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Repair, RepairStatus } from './entities/repair.entity';
import { RepairImage, RepairImageType } from './entities/repair-image.entity';
import { CreateRepairDto } from './dto/create-repair.dto';
import { UpdateRepairDto } from './dto/update-repair.dto';

@Injectable()
export class RepairsService {
  constructor(
    @InjectRepository(Repair)
    private repairsRepository: Repository<Repair>,
    @InjectRepository(RepairImage)
    private repairImagesRepository: Repository<RepairImage>,
  ) {}

  async create(createRepairDto: CreateRepairDto, userId: number): Promise<Repair> {
    const { images, ...repairData } = createRepairDto;

    const repair = this.repairsRepository.create({
      ...repairData,
      created_by: userId,
    });

    const savedRepair = await this.repairsRepository.save(repair);

    if (images && images.length > 0) {
      const repairImages = images.map((img) =>
        this.repairImagesRepository.create({
          image_url: img.image_url,
          image_type: img.image_type || RepairImageType.AFTER,
          caption: img.caption,
          repair_id: savedRepair.id,
        }),
      );
      await this.repairImagesRepository.save(repairImages);
    }

    return this.findOne(savedRepair.id);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: string,
  ): Promise<{ repairs: Repair[]; total: number }> {
    const queryBuilder = this.repairsRepository
      .createQueryBuilder('repair')
      .leftJoinAndSelect('repair.images', 'images')
      .leftJoinAndSelect('repair.createdBy', 'createdBy');

    if (status) {
      queryBuilder.andWhere('repair.status = :status', { status });
    }

    const [repairs, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('repair.created_at', 'DESC')
      .getManyAndCount();

    return { repairs, total };
  }

  async findOne(id: number): Promise<Repair> {
    const repair = await this.repairsRepository.findOne({
      where: { id },
      relations: ['images', 'createdBy'],
    });

    if (!repair) {
      throw new NotFoundException('Repair record not found');
    }

    return repair;
  }

  async update(id: number, updateRepairDto: UpdateRepairDto): Promise<Repair> {
    const repair = await this.findOne(id);
    const { images, ...repairData } = updateRepairDto;

    const updateData: any = {};
    if (repairData.title !== undefined) updateData.title = repairData.title;
    if (repairData.description !== undefined) updateData.description = repairData.description;
    if (repairData.device_type !== undefined) updateData.device_type = repairData.device_type;
    if (repairData.status !== undefined) updateData.status = repairData.status;

    await this.repairsRepository.update(id, updateData);

    if (images !== undefined) {
      await this.repairImagesRepository.delete({ repair_id: id });

      if (images && images.length > 0) {
        const repairImages = images.map((img) =>
          this.repairImagesRepository.create({
            image_url: img.image_url,
            image_type: img.image_type || RepairImageType.AFTER,
            caption: img.caption,
            repair_id: id,
          }),
        );
        await this.repairImagesRepository.save(repairImages);
      }
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const repair = await this.findOne(id);
    await this.repairsRepository.remove(repair);
  }
}
