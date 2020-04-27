/**
 * Provide connection to cache (in this case Redis)
 */
import Redis from "ioredis";
import { Logger } from "../logger";

const { REDIS_URL = "" } = process.env;
const client = new Redis(REDIS_URL);

const MAX_CACHE_RETRY_ATTEMPTS: number = 20;
let cacheConnectionAttempts: number = 0;

/**
 * Log when cache is connected
 */
client.on("connect", () => {
  const logger = new Logger(__filename);
  logger.info(`Cache connected`);
  cacheConnectionAttempts = 0; // reset
});

/**
 * Error handler for Redis cache
 */
client.on("error", (cacheError:any) => {
  const logger = new Logger(__filename);
  if (cacheConnectionAttempts >= MAX_CACHE_RETRY_ATTEMPTS) {

    logger.error(`Could not connect to cache after ${cacheConnectionAttempts} attempts. Killing process.`);
    process.exit(1);
  }
  logger.error(`Error connecting to cache`);
  logger.error(cacheError.message);
  cacheConnectionAttempts ++;
});

export default client;
