import { Repair } from './repair.entity';
export declare enum RepairImageType {
    BEFORE = "before",
    AFTER = "after",
    DURING = "during"
}
export declare class RepairImage {
    id: number;
    repair: Repair;
    repair_id: number;
    image_url: string;
    image_type: RepairImageType;
    caption: string;
    created_at: Date;
}
