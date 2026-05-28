"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcryptjs");
const user_entity_1 = require("./entities/user.entity");
let UsersService = class UsersService {
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async create(createUserDto) {
        const existingUser = await this.usersRepository.findOne({
            where: { email: createUserDto.email },
        });
        if (existingUser) {
            throw new common_1.BadRequestException('Email already exists');
        }
        const user = this.usersRepository.create({
            ...createUserDto,
            password: createUserDto.password ? await bcrypt.hash(createUserDto.password, 10) : '',
        });
        return this.usersRepository.save(user);
    }
    async findAll(page = 1, limit = 20) {
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
    async findOne(id) {
        const user = await this.usersRepository.findOne({
            where: { id },
            select: ['id', 'name', 'email', 'role', 'status', 'created_at'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async findByEmail(email) {
        return this.usersRepository.findOne({ where: { email } });
    }
    async update(id, updateUserDto) {
        const user = await this.findOne(id);
        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        }
        Object.assign(user, updateUserDto);
        return this.usersRepository.save(user);
    }
    async banUser(id) {
        const user = await this.findOne(id);
        user.status = user_entity_1.UserStatus.BANNED;
        return this.usersRepository.save(user);
    }
    async unbanUser(id) {
        const user = await this.findOne(id);
        user.status = user_entity_1.UserStatus.ACTIVE;
        return this.usersRepository.save(user);
    }
    async muteUser(id) {
        const user = await this.findOne(id);
        user.status = user_entity_1.UserStatus.MUTED;
        return this.usersRepository.save(user);
    }
    async remove(id) {
        const user = await this.findOne(id);
        await this.usersRepository.remove(user);
    }
    async setUserOnline(userId) {
        await this.usersRepository.update(userId, {
            is_online: true,
            last_online: new Date(),
        });
    }
    async setUserOffline(userId) {
        await this.usersRepository.update(userId, {
            is_online: false,
            last_online: new Date(),
        });
    }
    async validatePassword(password, hashedPassword) {
        return bcrypt.compare(password, hashedPassword);
    }
    async hashPassword(password) {
        return bcrypt.hash(password, 10);
    }
    async updateRole(id, role, currentUserId) {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (currentUserId === id && role !== user_entity_1.UserRole.ADMIN) {
            throw new common_1.BadRequestException('Cannot remove your own admin role');
        }
        user.role = role;
        return this.usersRepository.save(user);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map