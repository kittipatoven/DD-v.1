import { CreateRepairDto } from './create-repair.dto';
import { RepairStatus } from '../entities/repair.entity';
import { RepairImageType } from '../entities/repair-image.entity';
declare const UpdateRepairDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateRepairDto>>;
export declare class UpdateRepairDto extends UpdateRepairDto_base {
    status?: RepairStatus;
    images?: {
        image_url: string;
        image_type?: RepairImageType;
        caption?: string;
    }[];
}
export {};
