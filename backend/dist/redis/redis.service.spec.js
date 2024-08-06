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
const redis_service_1 = require("./redis.service");
describe('RedisService', () => {
    let service;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        const module = yield testing_1.Test.createTestingModule({
            providers: [redis_service_1.RedisService],
        }).compile();
        service = module.get(redis_service_1.RedisService);
        yield service.onModuleInit(); // Ensure Redis client is initialized
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield service.getClient().quit(); // Ensure Redis client is properly closed
    }));
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    it('should set and get values from Redis', () => __awaiter(void 0, void 0, void 0, function* () {
        yield service.set('test-key', 'test-value');
        const value = yield service.get('test-key');
        expect(value).toBe('test-value');
    }));
});
