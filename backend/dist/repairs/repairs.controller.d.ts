import { RepairsService } from './repairs.service';
import { CreateRepairDto } from './dto/create-repair.dto';
import { UpdateRepairDto } from './dto/update-repair.dto';
export declare class RepairsController {
    private readonly repairsService;
    constructor(repairsService: RepairsService);
    findAll(page?: string, limit?: string, status?: string): Promise<{
        repairs: import("./entities/repair.entity").Repair[];
        total: number;
    }>;
    findOne(id: string): Promise<import("./entities/repair.entity").Repair>;
    create(createRepairDto: CreateRepairDto, req: any, files: Express.Multer.File[]): Promise<import("./entities/repair.entity").Repair>;
    update(id: string, updateRepairDto: UpdateRepairDto): Promise<import("./entities/repair.entity").Repair>;
    remove(id: string): Promise<void>;
}
