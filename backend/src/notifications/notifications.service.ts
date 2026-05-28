import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async create(userId: number, message: string, type?: string, data?: any): Promise<Notification> {
    const notification = this.notificationsRepository.create({
      user_id: userId,
      message,
      type,
      data,
    });

    return this.notificationsRepository.save(notification);
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: 50,
    });
  }

  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { user_id: userId, is_read: false },
      order: { created_at: 'DESC' },
    });
  }

  async markAsRead(id: number, userId: number): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id, user_id: userId },
    });

    if (!notification) {
      return null;
    }

    notification.is_read = true;
    return this.notificationsRepository.save(notification);
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationsRepository.update(
      { user_id: userId, is_read: false },
      { is_read: true },
    );
  }

  async delete(id: number, userId: number): Promise<void> {
    const notification = await this.notificationsRepository.findOne({
      where: { id, user_id: userId },
    });

    if (notification) {
      await this.notificationsRepository.remove(notification);
    }
  }
}
