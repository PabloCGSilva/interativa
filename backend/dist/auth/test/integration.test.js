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
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const app_module_1 = require("../../app.module");
const request = require("supertest");
const dotenv = require("dotenv");
dotenv.config();
describe('Integration Test', () => {
    let app;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        const moduleFixture = yield testing_1.Test.createTestingModule({
            imports: [
                config_1.ConfigModule.forRoot({
                    isGlobal: true,
                }),
                typeorm_1.TypeOrmModule.forRootAsync({
                    imports: [config_1.ConfigModule],
                    useFactory: (configService) => ({
                        type: 'postgres',
                        host: configService.get('DATABASE_HOST'),
                        port: configService.get('DATABASE_PORT'),
                        username: configService.get('DATABASE_USER'),
                        password: configService.get('DATABASE_PASSWORD'),
                        database: configService.get('DATABASE_NAME'),
                        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
                        synchronize: true,
                    }),
                    inject: [config_1.ConfigService],
                }),
                app_module_1.AppModule,
            ],
        }).compile();
        app = moduleFixture.createNestApplication();
        yield app.init();
    }));
    it('should register a new user, login, and access protected route', () => __awaiter(void 0, void 0, void 0, function* () {
        const registerResponse = yield request(app.getHttpServer())
            .post('/auth/register')
            .send({ email: 'test@example.com', password: 'password' });
        expect(registerResponse.status).toBe(201);
        expect(registerResponse.body).toHaveProperty('id');
        const loginResponse = yield request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'test@example.com', password: 'password' });
        expect(loginResponse.status).toBe(200);
        expect(loginResponse.body).toHaveProperty('accessToken');
        const accessToken = loginResponse.body.accessToken;
        const protectedResponse = yield request(app.getHttpServer())
            .get('/protected')
            .set('Authorization', `Bearer ${accessToken}`);
        expect(protectedResponse.status).toBe(200);
    }));
    it('should handle password reset', () => __awaiter(void 0, void 0, void 0, function* () {
        const resetRequestResponse = yield request(app.getHttpServer())
            .post('/auth/forgot-password')
            .send({ email: 'test@example.com' });
        expect(resetRequestResponse.status).toBe(200);
        const resetToken = 'mock-reset-token';
        const resetPasswordResponse = yield request(app.getHttpServer())
            .post('/auth/reset-password')
            .send({ token: resetToken, email: 'test@example.com', newPassword: 'newpassword' });
        expect(resetPasswordResponse.status).toBe(200);
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield app.close();
    }));
});
