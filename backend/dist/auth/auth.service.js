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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const users_service_1 = require("../users/users.service");
const user_entity_1 = require("../users/entities/user.entity");
const login_attempt_entity_1 = require("./entities/login-attempt.entity");
const login_log_entity_1 = require("./entities/login-log.entity");
const user_entity_2 = require("../users/entities/user.entity");
const crypto = require("crypto");
let AuthService = class AuthService {
    constructor(usersService, jwtService, loginAttemptsRepository, loginLogsRepository, usersRepository) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.loginAttemptsRepository = loginAttemptsRepository;
        this.loginLogsRepository = loginLogsRepository;
        this.usersRepository = usersRepository;
    }
    async validateUser(email, password) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            return null;
        }
        const isPasswordValid = await this.usersService.validatePassword(password, user.password);
        if (!isPasswordValid) {
            return null;
        }
        if (user.status === user_entity_1.UserStatus.BANNED) {
            throw new common_1.UnauthorizedException('User is banned');
        }
        const { password: _, ...result } = user;
        return result;
    }
    async checkLoginAttempts(email) {
        const attempt = await this.loginAttemptsRepository.findOne({
            where: { email },
        });
        if (!attempt)
            return;
        if (attempt.locked_until && new Date() < attempt.locked_until) {
            const remainingTime = Math.ceil((attempt.locked_until.getTime() - Date.now()) / 60000);
            throw new common_1.UnauthorizedException(`Account locked. Try again in ${remainingTime} minutes.`);
        }
        if (attempt.locked_until && new Date() >= attempt.locked_until) {
            await this.loginAttemptsRepository.delete({ email });
        }
    }
    async recordFailedAttempt(email, ip, userAgent) {
        let attempt = await this.loginAttemptsRepository.findOne({
            where: { email },
        });
        if (!attempt) {
            attempt = this.loginAttemptsRepository.create({
                email,
                attempts: 1,
                last_attempt: new Date(),
                ip,
            });
        }
        else {
            attempt.attempts += 1;
            attempt.last_attempt = new Date();
            attempt.ip = ip;
            if (attempt.attempts >= 5) {
                attempt.locked_until = new Date(Date.now() + 5 * 60 * 1000);
            }
        }
        await this.loginAttemptsRepository.save(attempt);
        await this.loginLogsRepository.save({
            email,
            ip,
            user_agent: userAgent,
            status: 'failed',
            reason: 'Invalid credentials',
        });
    }
    async recordSuccessfulLogin(userId, email, ip, userAgent) {
        await this.loginAttemptsRepository.delete({ email });
        await this.loginLogsRepository.save({
            user_id: userId,
            email,
            ip,
            user_agent: userAgent,
            status: 'success',
        });
    }
    async login(loginDto, ip, userAgent) {
        await this.checkLoginAttempts(loginDto.email);
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            await this.recordFailedAttempt(loginDto.email, ip || 'unknown', userAgent);
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const payload = { email: user.email, sub: user.id, role: user.role };
        const token = this.jwtService.sign(payload);
        await this.recordSuccessfulLogin(user.id, user.email, ip || 'unknown', userAgent);
        return {
            access_token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        };
    }
    async register(registerDto) {
        const existingUser = await this.usersService.findByEmail(registerDto.email);
        if (existingUser) {
            throw new common_1.BadRequestException('Email already exists');
        }
        const user = await this.usersService.create({
            ...registerDto,
            role: registerDto.role || user_entity_1.UserRole.USER,
        });
        const payload = { email: user.email, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        };
    }
    async forgotPassword(forgotPasswordDto) {
        const user = await this.usersRepository.findOne({
            where: { email: forgotPasswordDto.email },
        });
        if (!user) {
            return {
                message: 'If the email exists, a reset link has been sent',
            };
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
        await this.usersRepository.update(user.id, {
            reset_token: resetToken,
            reset_token_expiry: resetTokenExpiry,
        });
        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
        console.log('Password Reset Link:', resetLink);
        return {
            message: 'If the email exists, a reset link has been sent',
            resetLink,
        };
    }
    async resetPassword(resetPasswordDto) {
        const user = await this.usersRepository.findOne({
            where: { reset_token: resetPasswordDto.token },
        });
        if (!user) {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        if (user.reset_token_expiry && new Date() > user.reset_token_expiry) {
            throw new common_1.BadRequestException('Reset token has expired');
        }
        const hashedPassword = await this.usersService.hashPassword(resetPasswordDto.password);
        await this.usersRepository.update(user.id, {
            password: hashedPassword,
            reset_token: null,
            reset_token_expiry: null,
        });
        return {
            message: 'Password has been reset successfully',
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(login_attempt_entity_1.LoginAttempt)),
    __param(3, (0, typeorm_1.InjectRepository)(login_log_entity_1.LoginLog)),
    __param(4, (0, typeorm_1.InjectRepository)(user_entity_2.User)),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AuthService);
//# sourceMappingURL=auth.service.js.map