import { RepairStatus } from '../entities/repair.entity';
import { RepairImageType } from '../entities/repair-image.entity';
export declare class CreateRepairDto {
    title: string;
    description?: string;
    device_type?: string;
    status?: RepairStatus;
    images?: {
        image_url: string;
        image_type?: RepairImageType;
        caption?: string;
    }[];
}
