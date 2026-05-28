import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, UserStatus } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const user = this.usersRepository.create({
      ...createUserDto,
      password: createUserDto.password ? await bcrypt.hash(createUserDto.password, 10) : '',
    });

    return this.usersRepository.save(user);
  }

  async findAll(page: number = 1, limit: number = 20): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.usersRepository.findAndCount({
      select: ['id', 'name', 'email', 'role', 'status', 'created_at'],
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'role', 'status', 'created_at'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async banUser(id: number): Promise<User> {
    const user = await this.findOne(id);
    user.status = UserStatus.BANNED;
    return this.usersRepository.save(user);
  }

  async unbanUser(id: number): Promise<User> {
    const user = await this.findOne(id);
    user.status = UserStatus.ACTIVE;
    return this.usersRepository.save(user);
  }

  async muteUser(id: number): Promise<User> {
    const user = await this.findOne(id);
    user.status = UserStatus.MUTED;
    return this.usersRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async setUserOnline(userId: number): Promise<void> {
    await this.usersRepository.update(userId, {
      is_online: true,
      last_online: new Date(),
    });
  }

  async setUserOffline(userId: number): Promise<void> {
    await this.usersRepository.update(userId, {
      is_online: false,
      last_online: new Date(),
    });
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async updateRole(id: number, role: UserRole, currentUserId: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent admin from removing their own admin role
    if (currentUserId === id && role !== UserRole.ADMIN) {
      throw new BadRequestException('Cannot remove your own admin role');
    }

    user.role = role;
    return this.usersRepository.save(user);
  }
}
