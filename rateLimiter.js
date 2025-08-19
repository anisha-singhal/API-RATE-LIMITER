// This Map will store the token bucket for each user (identified by IP address)
const tokenBucket = new Map();
// Middleware
const tokenBucketRateLimiter = (req, res, next) => {
// 1. Identify the user by their IP address
    const ip = req.ip
    
// 2. Rules for our rate limiter
    const BUCKET_SIZE = 10; // Maximum tokens in the bucket
    const REFILL_RATE = 2; // Tokens added per second
    
// 3. Check if this is a new user. If so, create a new bucket for them.
    if(!tokenBucket.has(ip)){
    tokenBucket.set(ip, {
      tokens: BUCKET_SIZE,
      lastRefill: Date.now(),
    });
    }

    const bucket = tokenBucket.get(ip);
    
// 4. Refill the bucket with new tokens based on time passed
    const now = Date.now();
    const timePassed = (now - bucket.lastRefill) / 1000;
    const tokensToAdd = timePassed * REFILL_RATE;

    bucket.tokens = Math.min(BUCKET_SIZE, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;

// 5. Check if the user has enough tokens to proceed
    if (bucket.tokens >= 1) {
    bucket.tokens -= 1; // Subtract one token
    tokenBucket.set(ip, bucket); // Save the new state
    next(); // The user is allowed, proceed to the API endpoint
    } 
    else {
    // 6. If not enough tokens, block the request
    res.status(429).send('Too Many Requests');
  }
}

// Export the middleware 
module.exports = tokenBucketRateLimiter;

