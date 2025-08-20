const Redis = require('ioredis');
const redis = new Redis();

async function testRedisConnection() {
    try{
        await redis.set('my-test-key', 'Hello Redis!');

        const value = await redis.get('my-test-key');
        console.log('Redis connection test successful:', value);

        redis.disconnect()
    }
    catch (error) {
        console.error('Error connecting to Redis:', error);
    }
}

testRedisConnection()