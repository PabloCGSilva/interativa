import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { Redis as RedisType } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client!: RedisType;

    onModuleInit() {
        this.client = new Redis({
            host: 'localhost',
            port: 6379,
        });
    }

    async onModuleDestroy() {
        await this.client.quit();
    }

    getClient(): RedisType {
        return this.client;
    }

    async get(key: string): Promise<string | null> {
        return this.client.get(key);
    }

    async set(key: string, value: string): Promise<string> {
        return this.client.set(key, value);
    }
}
