import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 3) {
        // Stop reconnecting after 3 tries if Redis server isn't running locally
        return new Error('Redis connection retry limit reached');
      }
      return Math.min(retries * 500, 2000);
    },
  },
});

redisClient.on('connect', () => {
  console.log('✅ Redis Client Connected successfully!');
});

redisClient.on('error', (err) => {
  // Silent warning for dev environment if redis server is not yet started locally
  console.log(`ℹ️  Redis Notice: Server not connected (${err.message || 'Offline'}). In-memory fallback available.`);
});

/**
 * Connect to Redis (to be called when ready)
 */
export const connectRedis = async () => {
  if (process.env.ENABLE_REDIS === 'true') {
    try {
      await redisClient.connect();
    } catch (err) {
      console.warn('⚠️  Could not connect to Redis server:', err.message);
    }
  } else {
    console.log('ℹ️  Redis is currently disabled in .env (Set ENABLE_REDIS=true to activate).');
  }
};

export default redisClient;
