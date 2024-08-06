"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const auth_service_1 = require("../auth.service");
const auth_controller_1 = require("../auth.controller");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../entities/user.entity");
const typeorm_2 = require("typeorm");
const redis_service_1 = require("../../redis/redis.service");
describe('AuthController', () => {
    let controller;
    let service;
    let repository;
    let redisService;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        const module = yield testing_1.Test.createTestingModule({
            controllers: [auth_controller_1.AuthController],
            providers: [
                auth_service_1.AuthService,
                jwt_1.JwtService,
                {
                    provide: (0, typeorm_1.getRepositoryToken)(user_entity_1.User),
                    useClass: typeorm_2.Repository,
                },
                {
                    provide: redis_service_1.RedisService,
                    useValue: {
                        set: jest.fn(),
                        get: jest.fn(),
                        del: jest.fn(),
                    },
                },
            ],
        }).compile();
        controller = module.get(auth_controller_1.AuthController);
        service = module.get(auth_service_1.AuthService);
        repository = module.get((0, typeorm_1.getRepositoryToken)(user_entity_1.User));
        redisService = module.get(redis_service_1.RedisService);
    }));
    describe('register', () => {
        it('should register a new user', () => __awaiter(void 0, void 0, void 0, function* () {
            const createUserDto = {
                password: 'test123',
                email: 'test@test.com',
            };
            jest.spyOn(service, 'register').mockResolvedValue(createUserDto);
            expect(yield controller.register(createUserDto)).toBe(createUserDto);
        }));
    });
    describe('login', () => {
        it('should login a user and return an access token', () => __awaiter(void 0, void 0, void 0, function* () {
            const loginUserDto = {
                email: 'test@test.com',
                password: 'test123',
            };
            const token = { accessToken: 'token' };
            jest.spyOn(service, 'login').mockResolvedValue(token);
            expect(yield controller.login(loginUserDto)).toBe(token);
        }));
    });
    describe('logout', () => {
        it('should invalidate JWT token on logout', () => __awaiter(void 0, void 0, void 0, function* () {
            const user = { id: 1, email: 'test@test.com' };
            jest.spyOn(service, 'logout').mockResolvedValue(undefined);
            expect(yield controller.logout({ user })).toBe(undefined);
        }));
    });
    describe('password recovery', () => {
        it('should request password recovery', () => __awaiter(void 0, void 0, void 0, function* () {
            const requestPasswordRecoveryDto = {
                email: 'test@test.com',
            };
            jest.spyOn(service, 'forgotPassword').mockResolvedValue(undefined);
            expect(yield controller.forgotPassword(requestPasswordRecoveryDto.email)).toBe(undefined);
        }));
        it('should reset password', () => __awaiter(void 0, void 0, void 0, function* () {
            const resetPasswordDto = {
                token: 'resetToken',
                email: 'test@test.com',
                newPassword: 'newPassword123',
            };
            jest.spyOn(service, 'resetPassword').mockResolvedValue(undefined);
            expect(yield controller.resetPassword(resetPasswordDto)).toBe(undefined);
        }));
    });
    describe('session management', () => {
        it('should store session tokens in Redis with expiration', () => __awaiter(void 0, void 0, void 0, function* () {
            const loginUserDto = {
                email: 'test@test.com',
                password: 'test123',
            };
            const token = { accessToken: 'token' };
            jest.spyOn(service, 'login').mockResolvedValue(token);
            const setSpy = jest.spyOn(redisService, 'set').mockResolvedValue('OK');
            yield controller.login(loginUserDto);
            expect(setSpy).toHaveBeenCalledWith(expect.any(String), token.accessToken, 'EX', expect.any(Number));
        }));
    });
});
