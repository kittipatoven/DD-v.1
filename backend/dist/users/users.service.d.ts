import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(page?: number, limit?: number): Promise<{
        data: User[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: number): Promise<User>;
    findByEmail(email: string): Promise<User>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<User>;
    banUser(id: number): Promise<User>;
    unbanUser(id: number): Promise<User>;
    muteUser(id: number): Promise<User>;
    remove(id: number): Promise<void>;
    setUserOnline(userId: number): Promise<void>;
    setUserOffline(userId: number): Promise<void>;
    validatePassword(password: string, hashedPassword: string): Promise<boolean>;
    hashPassword(password: string): Promise<string>;
    updateRole(id: number, role: UserRole, currentUserId: number): Promise<User>;
}
