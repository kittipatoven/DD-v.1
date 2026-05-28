import { Repository } from 'typeorm';
import { Repair } from './entities/repair.entity';
import { RepairImage } from './entities/repair-image.entity';
import { CreateRepairDto } from './dto/create-repair.dto';
import { UpdateRepairDto } from './dto/update-repair.dto';
export declare class RepairsService {
    private repairsRepository;
    private repairImagesRepository;
    constructor(repairsRepository: Repository<Repair>, repairImagesRepository: Repository<RepairImage>);
    create(createRepairDto: CreateRepairDto, userId: number): Promise<Repair>;
    findAll(page?: number, limit?: number, status?: string): Promise<{
        repairs: Repair[];
        total: number;
    }>;
    findOne(id: number): Promise<Repair>;
    update(id: number, updateRepairDto: UpdateRepairDto): Promise<Repair>;
    remove(id: number): Promise<void>;
}
