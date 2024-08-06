import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { AuthController } from '../auth.controller';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { RedisService } from '../../redis/redis.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { RequestPasswordRecoveryDto } from '../dto/request-password-recovery.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';

describe('AuthController', () => {
    let controller: AuthController;
    let service: AuthService;
    let repository: Repository<User>;
    let redisService: RedisService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                AuthService,
                JwtService,
                {
                    provide: getRepositoryToken(User),
                    useClass: Repository,
                },
                {
                    provide: RedisService,
                    useValue: {
                        set: jest.fn(),
                        get: jest.fn(),
                        del: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        service = module.get<AuthService>(AuthService);
        repository = module.get<Repository<User>>(getRepositoryToken(User));
        redisService = module.get<RedisService>(RedisService);
    });

    describe('register', () => {
        it('should register a new user', async () => {
            const createUserDto: CreateUserDto = {
                password: 'test123',
                email: 'test@test.com',
            };
            jest.spyOn(service, 'register').mockResolvedValue(createUserDto as any);

            expect(await controller.register(createUserDto)).toBe(createUserDto);
        });
    });

    describe('login', () => {
        it('should login a user and return an access token', async () => {
            const loginUserDto: LoginUserDto = {
                email: 'test@test.com',
                password: 'test123',
            };
            const token = { accessToken: 'token' };
            jest.spyOn(service, 'login').mockResolvedValue(token);

            expect(await controller.login(loginUserDto)).toBe(token);
        });
    });

    describe('logout', () => {
        it('should invalidate JWT token on logout', async () => {
            const user = { id: 1, email: 'test@test.com' } as User;
            jest.spyOn(service, 'logout').mockResolvedValue(undefined);

            expect(await controller.logout({ user } as any)).toBe(undefined);
        });
    });

    describe('password recovery', () => {
        it('should request password recovery', async () => {
            const requestPasswordRecoveryDto: RequestPasswordRecoveryDto = {
                email: 'test@test.com',
            };
            jest.spyOn(service, 'forgotPassword').mockResolvedValue(undefined);

            expect(await controller.forgotPassword(requestPasswordRecoveryDto.email)).toBe(undefined);
        });

        it('should reset password', async () => {
            const resetPasswordDto: ResetPasswordDto = {
                token: 'resetToken',
                email: 'test@test.com',
                newPassword: 'newPassword123',
            };
            jest.spyOn(service, 'resetPassword').mockResolvedValue(undefined);

            expect(await controller.resetPassword(resetPasswordDto)).toBe(undefined);
        });
    });

    describe('session management', () => {
        it('should store session tokens in Redis with expiration', async () => {
            const loginUserDto: LoginUserDto = {
                email: 'test@test.com',
                password: 'test123',
            };
            const token = { accessToken: 'token' };
            jest.spyOn(service, 'login').mockResolvedValue(token);
            const setSpy = jest.spyOn(redisService, 'set').mockResolvedValue('OK');

            await controller.login(loginUserDto);
            expect(setSpy).toHaveBeenCalledWith(expect.any(String), token.accessToken, 'EX', expect.any(Number));
        });
    });
});
