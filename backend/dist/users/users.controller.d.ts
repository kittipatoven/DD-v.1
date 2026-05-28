import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<import("./entities/user.entity").User>;
    findAll(page?: string, limit?: string): Promise<{
        data: import("./entities/user.entity").User[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<import("./entities/user.entity").User>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<import("./entities/user.entity").User>;
    banUser(id: string): Promise<import("./entities/user.entity").User>;
    unbanUser(id: string): Promise<import("./entities/user.entity").User>;
    muteUser(id: string): Promise<import("./entities/user.entity").User>;
    updateRole(id: string, role: 'admin' | 'user', req: any): Promise<import("./entities/user.entity").User>;
    remove(id: string): Promise<void>;
}
