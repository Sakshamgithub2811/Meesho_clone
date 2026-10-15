import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

let redisClient = null;

if (process.env.ENABLE_REDIS === "false") {
  console.log("ℹ️ Redis is disabled (ENABLE_REDIS=false). Skipping Redis connection.");
} else {
  redisClient = createClient({
    url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
    socket: {
      reconnectStrategy: (retries) => {
        // In local dev, stop retry loop after 2 attempts so console isn't spammed
        if (retries > 2) {
          return false;
        }
        return 1000;
      }
    }
  });

  let hasLoggedError = false;

  redisClient.on("connect", () => {
    console.log("🟢 Connected to Local Redis (127.0.0.1:6379) successfully!");
  });

  redisClient.on("error", (err) => {
    if (!hasLoggedError) {
      console.warn("⚠️ Local Redis is not running on port 6379. Running without cache (dev mode).");
      hasLoggedError = true;
    }
  });

  // Attempt initial connection safely without crashing
  redisClient.connect().catch(() => {
    // Gracefully ignored in development
  });
}

export default redisClient;