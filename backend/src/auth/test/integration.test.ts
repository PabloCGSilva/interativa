import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from '../../app.module';
import * as request from 'supertest';
import * as dotenv from 'dotenv';

dotenv.config();

export { };

describe('Integration Test', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                }),
                TypeOrmModule.forRootAsync({
                    imports: [ConfigModule],
                    useFactory: (configService: ConfigService) => ({
                        type: 'postgres',
                        host: configService.get<string>('DATABASE_HOST'),
                        port: configService.get<number>('DATABASE_PORT'),
                        username: configService.get<string>('DATABASE_USER'),
                        password: configService.get<string>('DATABASE_PASSWORD'),
                        database: configService.get<string>('DATABASE_NAME'),
                        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
                        synchronize: true,
                    }),
                    inject: [ConfigService],
                }),
                AppModule,
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('should register a new user, login, and access protected route', async () => {
        const registerResponse = await request(app.getHttpServer())
            .post('/auth/register')
            .send({ email: 'test@example.com', password: 'password' });

        expect(registerResponse.status).toBe(201);
        expect(registerResponse.body).toHaveProperty('id');

        const loginResponse = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'test@example.com', password: 'password' });

        expect(loginResponse.status).toBe(200);
        expect(loginResponse.body).toHaveProperty('accessToken');

        const accessToken = loginResponse.body.accessToken;

        const protectedResponse = await request(app.getHttpServer())
            .get('/protected')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(protectedResponse.status).toBe(200);
    });

    it('should handle password reset', async () => {
        const resetRequestResponse = await request(app.getHttpServer())
            .post('/auth/forgot-password')
            .send({ email: 'test@example.com' });

        expect(resetRequestResponse.status).toBe(200);

        const resetToken = 'mock-reset-token';

        const resetPasswordResponse = await request(app.getHttpServer())
            .post('/auth/reset-password')
            .send({ token: resetToken, email: 'test@example.com', newPassword: 'newpassword' });

        expect(resetPasswordResponse.status).toBe(200);
    });

    afterAll(async () => {
        await app.close();
    });
});
