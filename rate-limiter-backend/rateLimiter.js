/**
 * Token Bucket rate limiter middleware with atomic updates via Redis Lua.
 * - Refills by elapsed time and caps at bucket size
 * - Consumes one token per request when available
 * - Adds helpful headers and TTL for idle buckets
 */
const tokenBucketRateLimiter = (redis) => async (req, res, next) => {
  try {
    const config = await redis.hgetall('rate-limiter-config');
    const BUCKET_SIZE = parseInt(config.bucketSize, 10) || 10;
    const REFILL_RATE = parseInt(config.refillRate, 10) || 2;

    // Use a namespaced key for clarity and safe deletion patternsn    const ip = req.ip;
    const key = `rl:user:${ip}`;

    // TTL to let idle buckets expire (24h)
    const TTL_SECONDS = 24 * 60 * 60;

    // Atomic token bucket using Lua to avoid races under concurrency
    const script = `
      local key = KEYS[1]
      local bucketSize = tonumber(ARGV[1])
      local refillRate = tonumber(ARGV[2])
      local now = tonumber(ARGV[3])
      local ttlSeconds = tonumber(ARGV[4])

      local tokens = tonumber(redis.call('HGET', key, 'tokens'))
      local lastRefill = tonumber(redis.call('HGET', key, 'lastRefill'))

      if (tokens == nil) or (lastRefill == nil) then
        tokens = bucketSize
        lastRefill = now
      else
        local elapsed = (now - lastRefill) / 1000.0
        tokens = math.min(bucketSize, tokens + (elapsed * refillRate))
        lastRefill = now
      end

      local allowed = 0
      if tokens >= 1 then
        tokens = tokens - 1
        allowed = 1
      end

      redis.call('HSET', key, 'tokens', tokens, 'lastRefill', lastRefill)
      redis.call('EXPIRE', key, ttlSeconds)

      local secondsUntilNext = 0
      if allowed == 0 then
        secondsUntilNext = math.ceil((1 - tokens) / refillRate)
        if secondsUntilNext < 1 then secondsUntilNext = 1 end
      end

      return {allowed, tokens, secondsUntilNext}
    `;

    const now = Date.now();
    const [allowed, tokensRemaining, secondsUntilNext] = await redis.eval(
      script,
      1,
      key,
      BUCKET_SIZE,
      REFILL_RATE,
      now,
      TTL_SECONDS
    );

    // Standard rate limit headers
    res.set('X-RateLimit-Limit', String(BUCKET_SIZE));
    res.set('X-RateLimit-Remaining', String(Math.floor(tokensRemaining)));
    res.set('X-RateLimit-Refill-Rate', String(REFILL_RATE));

    if (allowed === 1 || allowed === '1') {
      return next();
    } else {
      // Helpful headers when blocked
      res.set('Retry-After', String(secondsUntilNext || 1));
      res.set('X-RateLimit-Reset', String(secondsUntilNext || 1));
      return res.status(429).send('Too Many Requests');
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = tokenBucketRateLimiter;
