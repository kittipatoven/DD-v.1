import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getMyNotifications(req: any): Promise<import("./entities/notification.entity").Notification[]>;
    getUnread(req: any): Promise<import("./entities/notification.entity").Notification[]>;
    create(data: {
        message: string;
        type?: string;
        data?: any;
    }, req: any): Promise<import("./entities/notification.entity").Notification>;
    markAsRead(id: string, req: any): Promise<import("./entities/notification.entity").Notification>;
    markAllAsRead(req: any): Promise<void>;
    remove(id: string, req: any): Promise<void>;
}
