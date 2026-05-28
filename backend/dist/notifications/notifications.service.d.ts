import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
export declare class NotificationsService {
    private notificationsRepository;
    constructor(notificationsRepository: Repository<Notification>);
    create(userId: number, message: string, type?: string, data?: any): Promise<Notification>;
    getUserNotifications(userId: number): Promise<Notification[]>;
    getUnreadNotifications(userId: number): Promise<Notification[]>;
    markAsRead(id: number, userId: number): Promise<Notification>;
    markAllAsRead(userId: number): Promise<void>;
    delete(id: number, userId: number): Promise<void>;
}
