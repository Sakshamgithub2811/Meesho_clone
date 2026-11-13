import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is always loaded regardless of execution directory
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config();

/**
 * Factory function to create a new PrismaClient instance
 * with error/warning logging and explicit connection URL from environment.
 */
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    ...(process.env.DATABASE_URL && {
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    }),
  });
};

// Global singleton reference to prevent multiple client instances during
// nodemon restarts, hot module reloading, or duplicate module evaluations.
const globalForPrisma = globalThis;

const prisma = globalForPrisma.__prismaInstance ?? createPrismaClient();

// In non-production environments (nodemon, dev), cache the instance globally
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prismaInstance = prisma;
} else if (!globalForPrisma.__prismaInstance) {
  globalForPrisma.__prismaInstance = prisma;
}

// Graceful connection cleanup on process termination to prevent lingering Postgres connection slots
const handleGracefulDisconnect = async () => {
  try {
    if (globalForPrisma.__prismaInstance) {
      await globalForPrisma.__prismaInstance.$disconnect();
    }
  } catch (err) {
    // Suppress errors during process exit
  }
};

process.once("beforeExit", handleGracefulDisconnect);
process.once("SIGINT", async () => {
  await handleGracefulDisconnect();
  process.exit(0);
});
process.once("SIGTERM", async () => {
  await handleGracefulDisconnect();
  process.exit(0);
});

export default prisma;
