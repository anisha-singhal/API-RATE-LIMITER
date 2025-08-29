const express = require('express');
const cors = require('cors');
const tokenBucketRateLimiter = require('./rateLimiter');
const app = express(); 
app.use(express.json());

app.use(cors({
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining','X-RateLimit-Refill-Rate'],
}));

app.set('trust proxy', 1);

const PORT = 8000;

app.get('/', (req, res) => {
    res.send('Server is up and running!');
});

app.get('/api/data', tokenBucketRateLimiter, (req, res) => {
  res.json({
    status: 'success',
    message: 'Here is your data!',
  });
});

app.post('/api/config', async (req, res) => {
  const { bucketSize, refillRate } = req.body;

  if (bucketSize === undefined || refillRate === undefined) {
    return res.status(400).json({ error: 'bucketSize and refillRate are required.' });
  }

  try {
    const Redis = require('ioredis');
    const redis = new Redis({ host: '127.0.0.1', port: 6379 });

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
  console.log(`🚀 Server is listening on http://localhost:${PORT}`);
});