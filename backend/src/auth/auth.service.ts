import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserStatus, UserRole } from '../users/entities/user.entity';
import { LoginAttempt } from './entities/login-attempt.entity';
import { LoginLog } from './entities/login-log.entity';
import { User } from '../users/entities/user.entity';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(LoginAttempt)
    private loginAttemptsRepository: Repository<LoginAttempt>,
    @InjectRepository(LoginLog)
    private loginLogsRepository: Repository<LoginLog>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return null;
    }

    const isPasswordValid = await this.usersService.validatePassword(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    if (user.status === UserStatus.BANNED) {
      throw new UnauthorizedException('User is banned');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async checkLoginAttempts(email: string): Promise<void> {
    const attempt = await this.loginAttemptsRepository.findOne({
      where: { email },
    });

    if (!attempt) return;

    // Check if account is locked
    if (attempt.locked_until && new Date() < attempt.locked_until) {
      const remainingTime = Math.ceil((attempt.locked_until.getTime() - Date.now()) / 60000);
      throw new UnauthorizedException(
        `Account locked. Try again in ${remainingTime} minutes.`
      );
    }

    // Reset if lock time has passed
    if (attempt.locked_until && new Date() >= attempt.locked_until) {
      await this.loginAttemptsRepository.delete({ email });
    }
  }

  async recordFailedAttempt(email: string, ip: string, userAgent?: string): Promise<void> {
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
    } else {
      attempt.attempts += 1;
      attempt.last_attempt = new Date();
      attempt.ip = ip;

      // Lock after 5 failed attempts
      if (attempt.attempts >= 5) {
        attempt.locked_until = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      }
    }

    await this.loginAttemptsRepository.save(attempt);

    // Log failed attempt
    await this.loginLogsRepository.save({
      email,
      ip,
      user_agent: userAgent,
      status: 'failed',
      reason: 'Invalid credentials',
    });
  }

  async recordSuccessfulLogin(userId: number, email: string, ip: string, userAgent?: string): Promise<void> {
    // Clear failed attempts
    await this.loginAttemptsRepository.delete({ email });

    // Log successful login
    await this.loginLogsRepository.save({
      user_id: userId,
      email,
      ip,
      user_agent: userAgent,
      status: 'success',
    });
  }

  async login(loginDto: LoginDto, ip?: string, userAgent?: string) {
    await this.checkLoginAttempts(loginDto.email);

    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      await this.recordFailedAttempt(loginDto.email, ip || 'unknown', userAgent);
      throw new UnauthorizedException('Invalid email or password');
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

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const user = await this.usersService.create({
      ...registerDto,
      role: registerDto.role || UserRole.USER,
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

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersRepository.findOne({
      where: { email: forgotPasswordDto.email },
    });

    // Always return success to prevent user enumeration
    if (!user) {
      return {
        message: 'If the email exists, a reset link has been sent',
      };
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save token to database
    await this.usersRepository.update(user.id, {
      reset_token: resetToken,
      reset_token_expiry: resetTokenExpiry,
    });

    // In production, send email with reset link
    // For now, log the token to console (for testing)
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    console.log('Password Reset Link:', resetLink);

    return {
      message: 'If the email exists, a reset link has been sent',
      resetLink, // Only for development/testing
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.usersRepository.findOne({
      where: { reset_token: resetPasswordDto.token },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Check if token is expired
    if (user.reset_token_expiry && new Date() > user.reset_token_expiry) {
      throw new BadRequestException('Reset token has expired');
    }

    // Hash new password
    const hashedPassword = await this.usersService.hashPassword(resetPasswordDto.password);

    // Update password and clear reset token
    await this.usersRepository.update(user.id, {
      password: hashedPassword,
      reset_token: null,
      reset_token_expiry: null,
    });

    return {
      message: 'Password has been reset successfully',
    };
  }

}
