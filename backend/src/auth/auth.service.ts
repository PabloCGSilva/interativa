import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import Redis from 'ioredis';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    private redisClient: Redis;

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
    ) {
        this.redisClient = new Redis({
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
            host: process.env.REDIS_HOST || '127.0.0.1',
        });
    }

    async register(createUserDto: CreateUserDto): Promise<User> {
        try {
            console.log('Registering user:', createUserDto);
            const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
            const newUser = this.userRepository.create({
                ...createUserDto,
                password: hashedPassword,
            });
            return await this.userRepository.save(newUser);
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error during user registration:', error.message);
            } else {
                console.error('Unexpected error during user registration');
            }
            throw new Error('Registration failed');
        }
    }

    async login(loginUserDto: LoginUserDto): Promise<{ accessToken: string }> {
        const user = await this.userRepository.findOne({ where: { email: loginUserDto.email } });
        if (!user || !(await bcrypt.compare(loginUserDto.password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { email: user.email, sub: user.id };
        const accessToken = this.jwtService.sign(payload);
        await this.redisClient.set(user.id.toString(), accessToken, 'EX', 60 * 60);
        return { accessToken };
    }




    async forgotPassword(email: string): Promise<void> {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new UnauthorizedException('Invalid email');
        }

        const resetToken = Math.random().toString(36).substring(2);
        await this.redisClient.set(`reset:${resetToken}`, user.id, 'EX', 60 * 60);

        console.log(`Password reset token for ${email}: ${resetToken}`);
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
        try {
            console.log('Resetting password for token:', resetPasswordDto.token);
            const userId = await this.redisClient.get(`reset:${resetPasswordDto.token}`);
            if (!userId) {
                throw new UnauthorizedException('Invalid or expired reset token');
            }

            const user = await this.userRepository.findOne({ where: { email: resetPasswordDto.email, id: parseInt(userId, 10) } });
            if (!user) {
                throw new UnauthorizedException('Invalid email or token');
            }

            const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);
            user.password = hashedPassword;
            await this.userRepository.save(user);

            await this.redisClient.del(`reset:${resetPasswordDto.token}`);
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error during password reset:', error.message);
            } else {
                console.error('Unexpected error during password reset');
            }
            throw new Error('Password reset failed');
        }
    }





    async logout(userId: number): Promise<void> {
        await this.redisClient.del(userId.toString());
    }
}
