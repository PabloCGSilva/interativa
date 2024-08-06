import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';

describe('RedisService', () => {
  let service: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RedisService],
    }).compile();

    service = module.get<RedisService>(RedisService);
    await service.onModuleInit();  // Ensure Redis client is initialized
  });

  afterAll(async () => {
    await service.getClient().quit(); // Ensure Redis client is properly closed
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should set and get values from Redis', async () => {
    await service.set('test-key', 'test-value');
    const value = await service.get('test-key');
    expect(value).toBe('test-value');
  });
});
