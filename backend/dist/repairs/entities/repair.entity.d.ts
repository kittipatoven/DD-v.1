import { RepairImage } from './repair-image.entity';
export declare enum RepairStatus {
    COMPLETED = "completed",
    IN_PROGRESS = "in_progress",
    PENDING = "pending"
}
export declare class Repair {
    id: number;
    title: string;
    description: string;
    device_type: string;
    status: RepairStatus;
    createdBy: any;
    created_by: number;
    created_at: Date;
    updated_at: Date;
    images: RepairImage[];
}
