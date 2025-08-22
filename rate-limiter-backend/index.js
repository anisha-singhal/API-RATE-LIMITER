const express = require('express');
const tokenBucketRateLimiter = require('./rateLimiter');
const app = express(); 

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

app.listen(PORT, () => {
  console.log(`🚀 Server is listening on http://localhost:${PORT}`);
});