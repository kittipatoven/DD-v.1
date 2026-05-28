import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto, ip: string, req: any): Promise<{
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
            role: import("../users/entities/user.entity").UserRole;
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
