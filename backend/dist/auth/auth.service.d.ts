import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserRole } from '../users/entities/user.entity';
import { LoginAttempt } from './entities/login-attempt.entity';
import { LoginLog } from './entities/login-log.entity';
import { User } from '../users/entities/user.entity';
export declare class AuthService {
    private usersService;
    private jwtService;
    private loginAttemptsRepository;
    private loginLogsRepository;
    private usersRepository;
    constructor(usersService: UsersService, jwtService: JwtService, loginAttemptsRepository: Repository<LoginAttempt>, loginLogsRepository: Repository<LoginLog>, usersRepository: Repository<User>);
    validateUser(email: string, password: string): Promise<any>;
    checkLoginAttempts(email: string): Promise<void>;
    recordFailedAttempt(email: string, ip: string, userAgent?: string): Promise<void>;
    recordSuccessfulLogin(userId: number, email: string, ip: string, userAgent?: string): Promise<void>;
    login(loginDto: LoginDto, ip?: string, userAgent?: string): Promise<{
        access_token: string;
        user: {
            id: any;
            name: any;
            email: any;
            role: any;
        };
    }>;
    register(registerDto: RegisterDto): Promise<{
        access_token: string;
        user: {
            id: number;
            name: string;
            email: string;
            role: UserRole;
        };
    }>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
        resetLink?: undefined;
    } | {
        message: string;
        resetLink: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
}
