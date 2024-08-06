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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const bcrypt = require("bcrypt");
const ioredis_1 = require("ioredis");
const jwt_1 = require("@nestjs/jwt");
let AuthService = class AuthService {
    constructor(userRepository, jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.redisClient = new ioredis_1.default({
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
            host: process.env.REDIS_HOST || '127.0.0.1',
        });
    }
    register(createUserDto) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('Registering user:', createUserDto);
                const hashedPassword = yield bcrypt.hash(createUserDto.password, 10);
                const newUser = this.userRepository.create(Object.assign(Object.assign({}, createUserDto), { password: hashedPassword }));
                return yield this.userRepository.save(newUser);
            }
            catch (error) {
                if (error instanceof Error) {
                    console.error('Error during user registration:', error.message);
                }
                else {
                    console.error('Unexpected error during user registration');
                }
                throw new Error('Registration failed');
            }
        });
    }
    login(loginUserDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findOne({ where: { email: loginUserDto.email } });
            if (!user || !(yield bcrypt.compare(loginUserDto.password, user.password))) {
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            const payload = { email: user.email, sub: user.id };
            const accessToken = this.jwtService.sign(payload);
            yield this.redisClient.set(user.id.toString(), accessToken, 'EX', 60 * 60);
            return { accessToken };
        });
    }
    forgotPassword(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findOne({ where: { email } });
            if (!user) {
                throw new common_1.UnauthorizedException('Invalid email');
            }
            const resetToken = Math.random().toString(36).substring(2);
            yield this.redisClient.set(`reset:${resetToken}`, user.id, 'EX', 60 * 60);
            console.log(`Password reset token for ${email}: ${resetToken}`);
        });
    }
    resetPassword(resetPasswordDto) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('Resetting password for token:', resetPasswordDto.token);
                const userId = yield this.redisClient.get(`reset:${resetPasswordDto.token}`);
                if (!userId) {
                    throw new common_1.UnauthorizedException('Invalid or expired reset token');
                }
                const user = yield this.userRepository.findOne({ where: { email: resetPasswordDto.email, id: parseInt(userId, 10) } });
                if (!user) {
                    throw new common_1.UnauthorizedException('Invalid email or token');
                }
                const hashedPassword = yield bcrypt.hash(resetPasswordDto.newPassword, 10);
                user.password = hashedPassword;
                yield this.userRepository.save(user);
                yield this.redisClient.del(`reset:${resetPasswordDto.token}`);
            }
            catch (error) {
                if (error instanceof Error) {
                    console.error('Error during password reset:', error.message);
                }
                else {
                    console.error('Unexpected error during password reset');
                }
                throw new Error('Password reset failed');
            }
        });
    }
    logout(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.redisClient.del(userId.toString());
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
