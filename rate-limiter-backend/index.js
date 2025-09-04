const express = require('express');
const cors = require('cors');
const tokenBucketRateLimiter = require('./rateLimiter');
const Redis = require('ioredis');
require('dotenv').config();

const app = express(); 
app.use(express.json());

app.use(cors({
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining','X-RateLimit-Refill-Rate'],
}));

app.set('trust proxy', 1);

let redis;
if (process.env.REDIS_HOST) {
  // This logic builds the connection URL from your existing environment variables.
  const redisURL = `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;
  redis = new Redis(redisURL, {
    // A secure tls connection is needed for external Redis providers.
    tls: {
      rejectUnauthorized: false
    }
  });
  console.log('Connecting to external Redis provided by environment variables...');
} else {
  // If no REDIS_HOST is found, we connect to the local database 
  redis = new Redis({ host: '127.0.0.1', port: 6379 });
  console.log('Connecting to Redis in local mode...');
}


redis.on('connect', () => console.log('Successfully connected to Redis.'));
redis.on('error', (err) => console.error('Redis Client Error:', err));

const PORT = process.env.PORT || 8000;

app.get('/', (req, res) => {
    res.send('Server is up and running!');
});

app.get('/api/data', tokenBucketRateLimiter(redis), (req, res) => {
  res.json({
    status: 'success',
    message: 'Here is your data!',
  });
});

app.get('/api/config', async (req, res) => {
  try {
    const config = await redis.hgetall('rate-limiter-config');
    res.json({
      bucketSize: parseInt(config.bucketSize, 10) || 10,
      refillRate: parseInt(config.refillRate, 10) || 2,
    });
  } catch (error) {
    console.error('Config fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch configuration.' });
  }
});

app.post('/api/config', async (req, res) => {
  const { bucketSize, refillRate } = req.body;

  if (bucketSize === undefined || refillRate === undefined) {
    return res.status(400).json({ error: 'bucketSize and refillRate are required.' });
  }
  try {
    await redis.hset('rate-limiter-config', {
      bucketSize: bucketSize,
      refillRate: refillRate,
    });
    
    res.json({ status: 'success', message: 'Configuration updated.' });
  } catch (error) {
    console.error('Config update error:', error);
    res.status(500).json({ error: 'Failed to update configuration.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is listening port ${PORT}`);
});