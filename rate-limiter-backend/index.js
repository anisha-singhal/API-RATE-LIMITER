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
if (process.env.NODE_ENV === 'production') {
  redis = new Redis(process.env.REDIS_URL, {
    socket: {
      tls: true,
      rejectUnauthorized: false
    }
  });
  console.log('Connecting to Redis in production mode...');
} else {
  redis = new Redis({ host: '127.0.0.1', port: 6379 });
  console.log('Connecting to Redis in local mode...');
}
redis.on('connect', () => console.log('Successfully connected to Redis.'));

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