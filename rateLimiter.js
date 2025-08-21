// Import the ioredis library
const Redis = require('ioredis');

// Initialize a new Redis client instance.
const redis = new Redis();

/**
 * An Express middleware that implements the Token Bucket algorithm for API rate limiting.
 * It uses Redis as a persistent, centralized data store for scalability.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The callback function to pass control to the next middleware.
 */
const tokenBucketRateLimiter = async (req, res, next) => {
  // parameters for the rate limiter.
  const BUCKET_SIZE = 10; // The maximum number of requests a user can make in a short burst.
  const REFILL_RATE = 2; // The number of tokens that are added back to the bucket each second.

  try {
    // Identify the user by their IP address. This will serve as the unique key in Redis.
    const ip = req.ip;
    const key = `user:${ip}`;

    // Check if a record for this user already exists in Redis.
    const userExists = await redis.exists(key);
    if (!userExists) {
      // If the user is new, create a new token bucket for them in a Redis Hash.
      // The bucket is initialized with the maximum number of tokens.
      await redis.hset(key, {
        tokens: BUCKET_SIZE,
        lastRefill: Date.now(),
      });
    }

    // Retrieve the user's current token bucket data from Redis.
    const bucketData = await redis.hgetall(key);

    // Convert the string values from Redis back into numbers.
    const bucket = {
      tokens: parseFloat(bucketData.tokens),
      lastRefill: parseInt(bucketData.lastRefill, 10),
    };

    //how much time has passed since the last refill.
    const now = Date.now();
    const timePassed = (now - bucket.lastRefill) / 1000; // in seconds

    //how many new tokens the user has earned in that time.
    const tokensToAdd = timePassed * REFILL_RATE;

    //new tokens to the bucket added, ensuring it doesn't exceed the maximum size.
    bucket.tokens = Math.min(BUCKET_SIZE, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;

    // Add custom headers to the response to inform the client of their current rate limit status.
    res.set('X-RateLimit-Limit', BUCKET_SIZE);
    res.set('X-RateLimit-Remaining', Math.floor(bucket.tokens));

    // Check if the user has at least one token to spend.
    if (bucket.tokens >= 1) {
      // If they do, subtract one token.
      bucket.tokens -= 1;

      // Update the bucket in Redis with the new token count and last refill time.
      await redis.hset(key, 'tokens', bucket.tokens, 'lastRefill', bucket.lastRefill);
      
      // The request is allowed. Pass control to the next middleware or the API endpoint.
      next();
    } else {
      // If the bucket is empty, block the request.
      res.status(429).send('Too Many Requests');
    }
  } catch (error) {
    // If any error occurs we pass the error
    next(error);
  }
};

// Exporting the middleware 
module.exports = tokenBucketRateLimiter;